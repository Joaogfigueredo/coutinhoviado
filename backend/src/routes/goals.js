import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import prisma from '../lib/prisma.js'

const router = Router()

const amountSchema = z
  .union([z.string(), z.number()])
  .transform((valor) => {
    if (typeof valor === 'string') {
      const normalized = valor.replace(/\s/g, '').replace(',', '.').trim()
      if (!normalized) return 0
      return Number(normalized)
    }
    return Number(valor)
  })
  .pipe(z.number().finite())
  .refine((valor) => Math.abs(valor) <= 1_000_000_000, 'Valor excede o limite permitido')
  .transform((valor) => new Prisma.Decimal((Math.round(valor * 100) / 100).toFixed(2)))

const CreateGoalSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional(),
  targetAmount: amountSchema,
  currentAmount: amountSchema.optional(),
  currency: z.string().trim().length(3).optional(),
  dueDate: z.union([z.string(), z.date()]).optional(),
  status: z.enum(['active', 'completed', 'cancelled']).optional(),
})

const UpdateGoalSchema = z.object({
  title: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(500).optional(),
  targetAmount: amountSchema.optional(),
  currentAmount: amountSchema.optional(),
  currency: z.string().trim().length(3).optional(),
  dueDate: z.union([z.string(), z.date()]).optional(),
  status: z.enum(['active', 'completed', 'cancelled']).optional(),
})

const contributionSchema = z.object({
  amount: amountSchema.refine((valor) => valor.greaterThan(new Prisma.Decimal(0)), 'Valor deve ser maior que zero'),
  description: z.string().trim().max(180).optional(),
  contributedAt: z.union([z.string(), z.date()]).optional(),
})

const listQuerySchema = z.object({
  includeHistory: z
    .preprocess((value) => {
      if (value === undefined || value === null || value === '') return undefined
      if (typeof value === 'boolean') return value
      if (typeof value === 'string') return value === 'true' || value === '1'
      return Boolean(value)
    }, z.boolean().optional())
    .optional(),
})

const contributionsListSchema = z.object({
  take: z.coerce.number().int().min(1).max(100).optional(),
})

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100

const formatDateOnly = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null
  const normalized = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return normalized.toISOString().slice(0, 10)
}

const parseDateOnly = (value) => {
  if (!value) return null

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate())
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null

    const datePortion = trimmed.split('T')[0]
    const parts = datePortion.split('-')
    if (parts.length === 3) {
      const [year, month, day] = parts.map(Number)
      if (!Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day)) {
        return new Date(year, month - 1, day)
      }
    }

    const parsed = new Date(trimmed)
    if (!Number.isNaN(parsed.getTime())) {
      return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
    }
    return null
  }

  if (typeof value === 'number') {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
    }
  }

  return null
}

const serializeContribution = (entry) => ({
  id: entry.id,
  goalId: entry.goalId,
  amount: Number(entry.amount ?? 0),
  description: entry.description ?? null,
  contributedAt: entry.contributedAt.toISOString(),
  createdAt: entry.createdAt.toISOString(),
})

const serializeGoal = (goal, { includeHistory = false, contributionsCount } = {}) => {
  const target = Number(goal.targetAmount ?? 0)
  const current = Number(goal.currentAmount ?? 0)
  const progress = target > 0 ? Math.min(current / target, 1) * 100 : 0
  const remaining = round2(target - current)
  const contributionsArray = goal.contributions ? [...goal.contributions] : []
  const lastContributionAt = contributionsArray.length ? contributionsArray[0].contributedAt.toISOString() : null
  const totalContributions = contributionsCount ?? goal._count?.contributions ?? contributionsArray.length

  return {
    id: goal.id,
    title: goal.title,
    description: goal.description ?? null,
    targetAmount: target,
    currentAmount: current,
    currency: goal.currency,
  dueDate: formatDateOnly(goal.dueDate),
    status: goal.status,
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString(),
    summary: {
      progress: round2(progress),
      remaining,
      contributionsCount: totalContributions,
      lastContributionAt,
    },
    contributions: includeHistory
      ? contributionsArray.map(serializeContribution)
      : undefined,
  }
}

let goalsSupportsCountInclude = true
let goalsSupportsContributionsInclude = true
let goalContributionsModelAvailable = Boolean(
  prisma.goalContribution && typeof prisma.goalContribution.findMany === 'function',
)

const isCountIncludeError = (error) =>
  error instanceof Prisma.PrismaClientValidationError && error.message.includes('Unknown field `_count`')
const isContributionsIncludeError = (error) =>
  error instanceof Prisma.PrismaClientValidationError && error.message.includes('Unknown field `contributions`')

const getGoalContributionDelegate = () => {
  if (!goalContributionsModelAvailable) return null
  const delegate = prisma.goalContribution
  if (!delegate) {
    goalContributionsModelAvailable = false
    return null
  }
  return delegate
}

const loadFallbackContributions = async (goalId, includeHistory) => {
  const delegate = getGoalContributionDelegate()
  if (!delegate || typeof delegate.findMany !== 'function') {
    return []
  }

  try {
    return await delegate.findMany({
      where: { goalId },
      orderBy: { contributedAt: 'desc' },
      ...(includeHistory ? {} : { take: 1 }),
    })
  } catch (error) {
    goalContributionsModelAvailable = false
    console.warn('Goal contributions fallback query failed:', error)
    return []
  }
}

const ensureGoalContributions = async (goals, includeHistory) => {
  if (goalsSupportsContributionsInclude || !goals.length) return goals

  const enriched = await Promise.all(
    goals.map(async (goal) => {
      const contributions = await loadFallbackContributions(goal.id, includeHistory)
      return { ...goal, contributions }
    }),
  )

  return enriched
}

const ensureSingleGoalContributions = async (goal, includeHistory) => {
  if (!goal || goalsSupportsContributionsInclude) return goal

  const contributions = await loadFallbackContributions(goal.id, includeHistory)
  return { ...goal, contributions }
}

async function fetchGoalsWithFallback(userId, includeHistory) {
  const contributionsInclude = goalsSupportsContributionsInclude
    ? {
        contributions: {
          orderBy: { contributedAt: 'desc' },
          ...(includeHistory ? {} : { take: 1 }),
        },
      }
    : undefined

  if (goalsSupportsCountInclude) {
    try {
      const goals = await prisma.goal.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: goalsSupportsContributionsInclude
          ? {
              _count: { select: { contributions: true } },
              ...contributionsInclude,
            }
          : {
              _count: { select: { contributions: true } },
            },
      })

      const hydratedGoals = await ensureGoalContributions(goals, includeHistory)
      return { goals: hydratedGoals, counts: null }
    } catch (error) {
      if (isContributionsIncludeError(error)) {
        goalsSupportsContributionsInclude = false
        return fetchGoalsWithFallback(userId, includeHistory)
      }
      if (!isCountIncludeError(error)) throw error
      goalsSupportsCountInclude = false
    }
  }

  let goals
  try {
    const query = {
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }
    if (contributionsInclude) {
      query.include = contributionsInclude
    }
    goals = await prisma.goal.findMany(query)
  } catch (error) {
    if (goalsSupportsContributionsInclude && isContributionsIncludeError(error)) {
      goalsSupportsContributionsInclude = false
      return fetchGoalsWithFallback(userId, includeHistory)
    }
    throw error
  }

  goals = await ensureGoalContributions(goals, includeHistory)

  const goalIds = goals.map((goal) => goal.id)
  if (!goalIds.length) {
    return { goals, counts: null }
  }

  const delegate = getGoalContributionDelegate()
  if (!delegate || typeof delegate.groupBy !== 'function') {
    return { goals, counts: null }
  }

  try {
    const counts = await delegate.groupBy({
      by: ['goalId'],
      where: { goalId: { in: goalIds } },
      _count: { goalId: true },
    })

    const map = new Map(counts.map((entry) => [entry.goalId, entry._count.goalId]))
    return { goals, counts: map }
  } catch (error) {
    goalContributionsModelAvailable = false
    console.warn('Goal contributions count fallback failed:', error)
    return { goals, counts: null }
  }
}

async function findGoalWithFallback(goalId, userId, { includeHistory = false } = {}) {
  const contributionsInclude = goalsSupportsContributionsInclude
    ? {
        contributions: {
          orderBy: { contributedAt: 'desc' },
          ...(includeHistory ? {} : { take: 1 }),
        },
      }
    : undefined

  if (goalsSupportsCountInclude) {
    try {
      const goal = await prisma.goal.findFirst({
        where: { id: goalId, userId },
        include: goalsSupportsContributionsInclude
          ? {
              _count: { select: { contributions: true } },
              ...contributionsInclude,
            }
          : {
              _count: { select: { contributions: true } },
            },
      })

      const hydratedGoal = await ensureSingleGoalContributions(goal, includeHistory)
      if (!hydratedGoal) return { goal: null, count: null }
      return { goal: hydratedGoal, count: hydratedGoal._count?.contributions ?? null }
    } catch (error) {
      if (isContributionsIncludeError(error)) {
        goalsSupportsContributionsInclude = false
        return findGoalWithFallback(goalId, userId, { includeHistory })
      }
      if (!isCountIncludeError(error)) throw error
      goalsSupportsCountInclude = false
    }
  }

  let goal
  try {
    const query = {
      where: { id: goalId, userId },
    }
    if (contributionsInclude) {
      query.include = contributionsInclude
    }
    goal = await prisma.goal.findFirst(query)
  } catch (error) {
    if (goalsSupportsContributionsInclude && isContributionsIncludeError(error)) {
      goalsSupportsContributionsInclude = false
      return findGoalWithFallback(goalId, userId, { includeHistory })
    }
    throw error
  }

  const hydratedGoal = await ensureSingleGoalContributions(goal, includeHistory)
  if (!hydratedGoal) return { goal: null, count: null }

  const delegate = getGoalContributionDelegate()
  if (!delegate || typeof delegate.count !== 'function') {
    const contributionsLength = Array.isArray(hydratedGoal.contributions) ? hydratedGoal.contributions.length : 0
    return { goal: hydratedGoal, count: contributionsLength }
  }

  try {
    const count = await delegate.count({ where: { goalId } })
    return { goal: hydratedGoal, count }
  } catch (error) {
    goalContributionsModelAvailable = false
    console.warn('Goal contributions count query failed:', error)
    const contributionsLength = Array.isArray(hydratedGoal.contributions) ? hydratedGoal.contributions.length : 0
    return { goal: hydratedGoal, count: contributionsLength }
  }
}

// Listar metas do usuário com resumo
router.get('/', requireAuth, async (req, res) => {
  try {
    const { includeHistory } = listQuerySchema.parse(req.query)

    const { goals, counts } = await fetchGoalsWithFallback(req.user.id, includeHistory)

    res.json({
      goals: goals.map((goal) => {
        const contributionsList = Array.isArray(goal.contributions) ? goal.contributions : []
        const contributionsCount = counts ? counts.get(goal.id) ?? contributionsList.length : contributionsList.length
        return serializeGoal({ ...goal, contributions: contributionsList }, { includeHistory, contributionsCount })
      }),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: 'Parâmetros inválidos', issues: error.flatten() })
    }
    console.error('List goals error:', error)
    res.status(500).json({ error: 'Falha ao listar metas' })
  }
})

// Criar meta
router.post('/', requireAuth, async (req, res) => {
  try {
    const payload = CreateGoalSchema.parse(req.body)
    const created = await prisma.goal.create({
      data: {
        title: payload.title,
        description: payload.description ?? null,
        targetAmount: payload.targetAmount,
        currentAmount: payload.currentAmount ?? new Prisma.Decimal('0'),
        currency: payload.currency ?? 'BRL',
        dueDate: parseDateOnly(payload.dueDate),
        status: payload.status ?? 'active',
        userId: req.user.id,
      },
    })

    const { goal, count } = await findGoalWithFallback(created.id, req.user.id, { includeHistory: false })

    res.status(201).json({
      goal: serializeGoal(goal ?? { ...created, contributions: [] }, {
        includeHistory: false,
        contributionsCount: count ?? 0,
      }),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: 'Dados inválidos', issues: error.flatten() })
    }
    console.error('Create goal error:', error)
    res.status(500).json({ error: 'Falha ao criar meta' })
  }
})

// Atualizar meta
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'ID inválido' })

    const payload = UpdateGoalSchema.parse(req.body)
    if (!Object.keys(payload).length) return res.status(422).json({ error: 'Nenhum dado para atualizar' })

    const existing = await prisma.goal.findFirst({ where: { id, userId: req.user.id } })
    if (!existing) return res.status(404).json({ error: 'Meta não encontrada' })

    await prisma.goal.update({
      where: { id },
      data: {
        title: payload.title ?? undefined,
        description: payload.description ?? undefined,
        targetAmount: payload.targetAmount ?? undefined,
        currentAmount: payload.currentAmount ?? undefined,
        currency: payload.currency ?? undefined,
        dueDate: payload.dueDate === undefined ? undefined : parseDateOnly(payload.dueDate),
        status: payload.status ?? undefined,
      },
    })

    const { goal, count } = await findGoalWithFallback(id, req.user.id, { includeHistory: false })
    if (!goal) {
      return res.status(404).json({ error: 'Meta não encontrada' })
    }

    res.json({
      goal: serializeGoal(goal, {
        includeHistory: false,
        contributionsCount: count ?? undefined,
      }),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: 'Dados inválidos', issues: error.flatten() })
    }
    console.error('Update goal error:', error)
    res.status(500).json({ error: 'Falha ao atualizar meta' })
  }
})

// Remover meta
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'ID inválido' })

    const existing = await prisma.goal.findFirst({ where: { id, userId: req.user.id } })
    if (!existing) return res.status(404).json({ error: 'Meta não encontrada' })

    await prisma.goal.delete({ where: { id } })
    res.status(204).send()
  } catch (error) {
    console.error('Delete goal error:', error)
    res.status(500).json({ error: 'Falha ao remover meta' })
  }
})

// Registrar contribuição
router.post('/:id/contributions', requireAuth, async (req, res) => {
  try {
    const goalId = Number(req.params.id)
    if (!Number.isInteger(goalId)) return res.status(400).json({ error: 'ID inválido' })

    const payload = contributionSchema.parse(req.body)

    const goal = await prisma.goal.findFirst({ where: { id: goalId, userId: req.user.id } })
    if (!goal) return res.status(404).json({ error: 'Meta não encontrada' })

    const contributionsDelegate = getGoalContributionDelegate()
    if (!contributionsDelegate || typeof contributionsDelegate.create !== 'function') {
      goalContributionsModelAvailable = false
      return res.status(503).json({ error: 'Registro de contribuições indisponível no momento' })
    }

    const contributedAt = payload.contributedAt ? new Date(payload.contributedAt) : new Date()

    const { contribution, goalSnapshot, contributions, contributionsCount } = await prisma.$transaction(async (tx) => {
      const createdContribution = await tx.goalContribution.create({
        data: {
          goalId,
          amount: payload.amount,
          description: payload.description ?? null,
          contributedAt,
        },
      })

      const nextAmount = goal.currentAmount.plus(payload.amount)
      const needsComplete = nextAmount.greaterThanOrEqualTo(goal.targetAmount) && goal.status === 'active'

      const updated = await tx.goal.update({
        where: { id: goalId },
        data: {
          currentAmount: nextAmount,
          status: needsComplete ? 'completed' : undefined,
        },
      })

      const recentContributions = await tx.goalContribution.findMany({
        where: { goalId },
        orderBy: { contributedAt: 'desc' },
        take: 5,
      })

      const totalContributions = await tx.goalContribution.count({ where: { goalId } })

      return {
        contribution: createdContribution,
        goalSnapshot: updated,
        contributions: recentContributions,
        contributionsCount: totalContributions,
      }
    })

    res.status(201).json({
      contribution: serializeContribution(contribution),
      goal: serializeGoal({ ...goalSnapshot, contributions }, {
        includeHistory: false,
        contributionsCount,
      }),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: 'Dados inválidos', issues: error.flatten() })
    }
    console.error('Create goal contribution error:', error)
    res.status(500).json({ error: 'Falha ao registrar contribuição' })
  }
})

// Listar contribuições de uma meta
router.get('/:id/contributions', requireAuth, async (req, res) => {
  try {
    const goalId = Number(req.params.id)
    if (!Number.isInteger(goalId)) return res.status(400).json({ error: 'ID inválido' })

    const { take } = contributionsListSchema.parse(req.query)

    const goal = await prisma.goal.findFirst({ where: { id: goalId, userId: req.user.id }, select: { id: true } })
    if (!goal) return res.status(404).json({ error: 'Meta não encontrada' })

    const contributionsDelegate = getGoalContributionDelegate()
    if (!contributionsDelegate || typeof contributionsDelegate.findMany !== 'function') {
      goalContributionsModelAvailable = false
      return res.json({ contributions: [] })
    }

    const contributions = await contributionsDelegate.findMany({
      where: { goalId },
      orderBy: { contributedAt: 'desc' },
      take: take ?? undefined,
    })

    res.json({ contributions: contributions.map(serializeContribution) })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: 'Parâmetros inválidos', issues: error.flatten() })
    }
    console.error('List goal contributions error:', error)
    res.status(500).json({ error: 'Falha ao listar contribuições' })
  }
})

// Remover contribuição
router.delete('/contributions/:contributionId', requireAuth, async (req, res) => {
  try {
    const contributionId = Number(req.params.contributionId)
    if (!Number.isInteger(contributionId)) return res.status(400).json({ error: 'ID inválido' })

    const contributionsDelegate = getGoalContributionDelegate()
    if (!contributionsDelegate || typeof contributionsDelegate.findFirst !== 'function') {
      goalContributionsModelAvailable = false
      return res.status(503).json({ error: 'Recurso de contribuições indisponível no momento' })
    }

    const contribution = await contributionsDelegate.findFirst({
      where: { id: contributionId },
      include: { goal: true },
    })

    if (!contribution || contribution.goal.userId !== req.user.id) {
      return res.status(404).json({ error: 'Contribuição não encontrada' })
    }

    await prisma.$transaction(async (tx) => {
      await tx.goalContribution.delete({ where: { id: contributionId } })

      const updatedAmount = contribution.goal.currentAmount.minus(contribution.amount)
      const newStatus = contribution.goal.status === 'completed' && updatedAmount.lessThan(contribution.goal.targetAmount)
        ? 'active'
        : contribution.goal.status

      await tx.goal.update({
        where: { id: contribution.goalId },
        data: {
          currentAmount: updatedAmount,
          status: newStatus,
        },
      })
    })

    res.status(204).send()
  } catch (error) {
    console.error('Delete goal contribution error:', error)
    res.status(500).json({ error: 'Falha ao remover contribuição' })
  }
})

export default router
