import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import prisma from '../lib/prisma.js'

const router = Router()

const amountSchema = z
  .union([z.string(), z.number()])
  .transform((v) => {
    if (typeof v === 'string') {
      const normalized = v.replace(/\s/g, '').replace(',', '.')
      return Number(normalized)
    }
    return Number(v)
  })
  .pipe(z.number().finite())
  .transform((v) => new Prisma.Decimal((Math.round(v * 100) / 100).toFixed(2)))

let budgetsSupportsCategoryRelation = true

const isCategoryFieldError = (error) =>
  error instanceof Prisma.PrismaClientValidationError && /`category(Id)?`/.test(error.message)

const parseCategoryInput = (value) => {
  if (value === undefined) return undefined
  if (value === null || value === '' || value === 'null') return null
  return value
}

const categoryIdSchema = z.preprocess(
  parseCategoryInput,
  z.union([z.coerce.number().int().positive(), z.null()]).optional(),
)

const CreateBudgetSchema = z.object({
  name: z.string().trim().min(2).max(120),
  limitAmount: amountSchema,
  period: z.enum(['monthly', 'yearly', 'weekly']).optional(),
  categoryId: categoryIdSchema,
})

const UpdateBudgetSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  limitAmount: amountSchema.optional(),
  currentSpent: amountSchema.optional(),
  period: z.enum(['monthly', 'yearly', 'weekly']).optional(),
  status: z.enum(['active', 'paused', 'archived']).optional(),
  categoryId: categoryIdSchema,
})

const budgetsQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  includeArchived: z
    .preprocess((value) => {
      if (value === undefined || value === null || value === '') return undefined
      if (typeof value === 'boolean') return value
      if (typeof value === 'string') return value === 'true' || value === '1'
      return Boolean(value)
    }, z.boolean().optional())
    .optional(),
})

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100

function getPeriodRange(monthInput, yearInput) {
  const today = new Date()
  const month = monthInput ?? today.getUTCMonth() + 1
  const year = yearInput ?? today.getUTCFullYear()
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0))
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))
  return { month, year, start, end }
}

async function ensureCategory(userId, categoryId) {
  if (!categoryId) return null
  const category = await prisma.category.findFirst({ where: { id: categoryId, userId } })
  if (!category) {
    const error = new Error('Categoria não encontrada')
    error.status = 404
    throw error
  }
  return category
}

router.get('/', requireAuth, async (req, res) => {
  try {
  const { month, year, includeArchived } = budgetsQuerySchema.parse(req.query)
  const { month: resolvedMonth, year: resolvedYear, start, end } = getPeriodRange(month, year)

    const budgets = await prisma.budget.findMany({
      where: {
        userId: req.user.id,
        ...(includeArchived ? {} : { status: { not: 'archived' } }),
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    })

    const categoryIdList = budgetsSupportsCategoryRelation
      ? budgets
          .map((budget) => (Object.prototype.hasOwnProperty.call(budget, 'categoryId') ? budget.categoryId : undefined))
          .filter((value) => value != null)
      : []

    const categories = budgetsSupportsCategoryRelation && categoryIdList.length
      ? await prisma.category.findMany({
          where: { id: { in: [...new Set(categoryIdList)] } },
          select: { id: true, name: true, color: true },
        })
      : []

    const categoryMap = budgetsSupportsCategoryRelation
      ? new Map(categories.map((category) => [category.id, category]))
      : new Map()

    const categoryTotals = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        account: { userId: req.user.id },
        status: 'confirmado',
        tipo: 'despesa',
        data: { gte: start, lte: end },
      },
      _sum: { valor: true },
    })

    const categoryNameTotals = budgets.some((b) => b.categoryId == null)
      ? await prisma.transaction.groupBy({
          by: ['categoria'],
          where: {
            account: { userId: req.user.id },
            status: 'confirmado',
            tipo: 'despesa',
            data: { gte: start, lte: end },
          },
          _sum: { valor: true },
        })
      : []

    const spentByCategoryId = new Map()
    categoryTotals.forEach((entry) => {
      const key = entry.categoryId ?? 'null'
      spentByCategoryId.set(key, Number(entry._sum?.valor ?? 0))
    })

    const spentByCategoryName = new Map()
    categoryNameTotals.forEach((entry) => {
      spentByCategoryName.set(entry.categoria, Number(entry._sum?.valor ?? 0))
    })

    const enriched = budgets.map((budget) => {
      const limitValue = Number(budget.limitAmount ?? 0)
      const rawSpent = budgetsSupportsCategoryRelation && Object.prototype.hasOwnProperty.call(budget, 'categoryId') && budget.categoryId != null
        ? spentByCategoryId.get(budget.categoryId) ?? 0
        : spentByCategoryId.get('null') ?? spentByCategoryName.get(budget.name) ?? Number(budget.currentSpent ?? 0)

  const spent = round2(rawSpent)
  const remaining = round2(limitValue - spent)
      const progress = limitValue > 0 ? Math.min(spent / limitValue, 1) * 100 : 0
      let monthStatus = 'ok'
      if (limitValue <= 0) monthStatus = 'undefined'
      else if (spent >= limitValue) monthStatus = 'exceeded'
      else if (spent >= limitValue * 0.9) monthStatus = 'warning'

      return {
        id: budget.id,
        name: budget.name,
        period: budget.period,
        status: budget.status,
        createdAt: budget.createdAt,
        updatedAt: budget.updatedAt,
        limitAmount: limitValue,
        currentSpent: Number(budget.currentSpent ?? 0),
        category:
          budgetsSupportsCategoryRelation && Object.prototype.hasOwnProperty.call(budget, 'categoryId') && budget.categoryId != null
            ? categoryMap.get(budget.categoryId) ?? null
            : null,
        monthlyStatus: {
          month: resolvedMonth,
          year: resolvedYear,
          spent,
          remaining: round2(remaining),
          progress: round2(progress),
          status: monthStatus,
        },
      }
    })

    res.json({
      budgets: enriched,
      meta: {
        period: {
          month: resolvedMonth,
          year: resolvedYear,
          start: start.toISOString(),
          end: end.toISOString(),
        },
      },
    })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(422).json({ error: 'Parâmetros inválidos', issues: e.flatten() })
    }
    console.error('List budgets error:', e)
    res.status(e.status ?? 500).json({ error: e.message ?? 'Falha ao listar orçamentos' })
  }
})

router.post('/', requireAuth, async (req, res) => {
  try {
    const payload = CreateBudgetSchema.parse(req.body)
    let budget
    let category = null

    try {
      const data = {
        userId: req.user.id,
        name: payload.name,
        limitAmount: payload.limitAmount,
        currentSpent: new Prisma.Decimal('0'),
        period: payload.period ?? 'monthly',
        ...(budgetsSupportsCategoryRelation && typeof payload.categoryId === 'number' ? { categoryId: payload.categoryId } : {}),
      }

      if (budgetsSupportsCategoryRelation && typeof payload.categoryId === 'number') {
        await ensureCategory(req.user.id, payload.categoryId)
      }

      budget = await prisma.budget.create({ data })

      if (
        budgetsSupportsCategoryRelation &&
        Object.prototype.hasOwnProperty.call(budget, 'categoryId') &&
        typeof budget.categoryId === 'number'
      ) {
        category = await prisma.category.findUnique({
          where: { id: budget.categoryId },
          select: { id: true, name: true, color: true },
        })
      }
    } catch (error) {
      if (isCategoryFieldError(error)) {
        budgetsSupportsCategoryRelation = false
        budget = await prisma.budget.create({
          data: {
            userId: req.user.id,
            name: payload.name,
            limitAmount: payload.limitAmount,
            currentSpent: new Prisma.Decimal('0'),
            period: payload.period ?? 'monthly',
          },
        })
      } else {
        throw error
      }
    }

    res.status(201).json({
      budget: {
        ...budget,
        limitAmount: Number(budget.limitAmount ?? 0),
        currentSpent: Number(budget.currentSpent ?? 0),
        category,
      },
    })
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(422).json({ error: 'Dados inválidos', issues: e.flatten() })
    console.error('Create budget error:', e)
    const status = e.status ?? 500
    res.status(status).json({ error: e.message ?? 'Falha ao criar orçamento' })
  }
})

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'ID inválido' })
    const payload = UpdateBudgetSchema.parse(req.body)

    const existing = await prisma.budget.findFirst({ where: { id, userId: req.user.id } })
    if (!existing) return res.status(404).json({ error: 'Orçamento não encontrado' })

    let category = null
    let updated

    try {
      const data = {}

      if (payload.name !== undefined) data.name = payload.name
      if (payload.limitAmount !== undefined) data.limitAmount = payload.limitAmount
      if (payload.currentSpent !== undefined) data.currentSpent = payload.currentSpent
      if (payload.period !== undefined) data.period = payload.period
      if (payload.status !== undefined) data.status = payload.status

      if (budgetsSupportsCategoryRelation && Object.prototype.hasOwnProperty.call(payload, 'categoryId')) {
        if (typeof payload.categoryId === 'number') {
          await ensureCategory(req.user.id, payload.categoryId)
          data.categoryId = payload.categoryId
        } else {
          data.categoryId = null
        }
      }

      updated = await prisma.budget.update({
        where: { id },
        data,
      })

      if (
        budgetsSupportsCategoryRelation &&
        Object.prototype.hasOwnProperty.call(updated, 'categoryId') &&
        typeof updated.categoryId === 'number'
      ) {
        category = await prisma.category.findUnique({
          where: { id: updated.categoryId },
          select: { id: true, name: true, color: true },
        })
      }
    } catch (error) {
      if (isCategoryFieldError(error)) {
        budgetsSupportsCategoryRelation = false
        const fallbackData = {}
        if (payload.name !== undefined) fallbackData.name = payload.name
        if (payload.limitAmount !== undefined) fallbackData.limitAmount = payload.limitAmount
        if (payload.currentSpent !== undefined) fallbackData.currentSpent = payload.currentSpent
        if (payload.period !== undefined) fallbackData.period = payload.period
        if (payload.status !== undefined) fallbackData.status = payload.status
        updated = await prisma.budget.update({ where: { id }, data: fallbackData })
      } else {
        throw error
      }
    }

    res.json({
      budget: {
        ...updated,
        limitAmount: Number(updated.limitAmount ?? 0),
        currentSpent: Number(updated.currentSpent ?? 0),
        category,
      },
    })
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(422).json({ error: 'Dados inválidos', issues: e.flatten() })
    console.error('Update budget error:', e)
    const status = e.status ?? 500
    res.status(status).json({ error: e.message ?? 'Falha ao atualizar orçamento' })
  }
})

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'ID inválido' })
    const existing = await prisma.budget.findFirst({ where: { id, userId: req.user.id } })
    if (!existing) return res.status(404).json({ error: 'Orçamento não encontrado' })
    await prisma.budget.delete({ where: { id } })
    res.status(204).send()
  } catch (e) {
    console.error('Delete budget error:', e)
    res.status(500).json({ error: 'Falha ao remover orçamento' })
  }
})

router.post('/:id/reset-spent', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'ID inválido' })
    const existing = await prisma.budget.findFirst({ where: { id, userId: req.user.id } })
    if (!existing) return res.status(404).json({ error: 'Orçamento não encontrado' })

    let updated
    let category = null

    try {
      updated = await prisma.budget.update({
        where: { id },
        data: { currentSpent: new Prisma.Decimal('0') },
      })

      if (
        budgetsSupportsCategoryRelation &&
        Object.prototype.hasOwnProperty.call(updated, 'categoryId') &&
        typeof updated.categoryId === 'number'
      ) {
        category = await prisma.category.findUnique({
          where: { id: updated.categoryId },
          select: { id: true, name: true, color: true },
        })
      }
    } catch (error) {
      if (isCategoryFieldError(error)) {
        budgetsSupportsCategoryRelation = false
        updated = await prisma.budget.update({
          where: { id },
          data: { currentSpent: new Prisma.Decimal('0') },
        })
      } else {
        throw error
      }
    }

    res.json({
      budget: {
        ...updated,
        limitAmount: Number(updated.limitAmount ?? 0),
        currentSpent: 0,
        category,
      },
    })
  } catch (e) {
    console.error('Reset budget error:', e)
    res.status(500).json({ error: 'Falha ao resetar orçamento' })
  }
})

export default router
