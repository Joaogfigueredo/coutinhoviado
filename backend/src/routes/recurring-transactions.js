import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import prisma from '../lib/prisma.js'

const router = Router()

// util: detecta se o modelo existe no Prisma Client
const hasModel = (client, modelName) => {
  const model = client?.[modelName]
  return !!model && (typeof model.findMany === 'function' || typeof model.findFirst === 'function' || typeof model.findUnique === 'function')
}

const FREQUENCY_VALUES = ['daily', 'weekly', 'monthly', 'yearly']
const STATUS_VALUES = ['confirmado', 'pendente']
const TIPO_VALUES = ['receita', 'despesa']
const MAX_OCCURRENCES_PER_RUN = 24

const decimalFromNumber = (value) => new Prisma.Decimal((Math.round(Number(value) * 100) / 100).toFixed(2))

const valorSchema = z
  .union([z.string(), z.number()])
  .transform((valor) => {
    if (typeof valor === 'string') {
      const normalized = valor.replace(/\u00a0/g, '').replace(/[^0-9,.-]/g, '').replace(',', '.').trim()
      if (!normalized) throw new Error('Valor inválido')
      return Number(normalized)
    }
    return valor
  })
  .pipe(z.number().finite())
  .refine((valor) => valor > 0, 'Valor deve ser maior que zero')

const dateSchema = z
  .union([z.string(), z.date()])
  .transform((input) => {
    const date = typeof input === 'string' ? new Date(input) : input
    if (Number.isNaN(date.getTime())) throw new Error('Data inválida')
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  })

const optionalDateSchema = z
  .union([z.string(), z.date()])
  .transform((input) => {
    if (input === undefined || input === null || input === '') return undefined
    const date = typeof input === 'string' ? new Date(input) : input
    if (Number.isNaN(date.getTime())) throw new Error('Data inválida')
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  })
  .optional()

const optionalCategoryId = z.preprocess(
  (value) => (value === undefined || value === '' ? undefined : value),
  z.coerce.number().int().positive().optional()
)

const RecurringBaseSchema = z.object({
  descricao: z.string().trim().min(2).max(180),
  valor: valorSchema,
  tipo: z.enum([TIPO_VALUES[0], TIPO_VALUES[1]]),
  status: z.enum([STATUS_VALUES[0], STATUS_VALUES[1]]).default(STATUS_VALUES[0]),
  categoria: z.string().trim().min(1).max(80).optional(),
  categoryId: optionalCategoryId,
  observacao: z.string().trim().max(500).optional(),
  accountId: z.coerce.number().int().positive(),
  frequency: z.enum([FREQUENCY_VALUES[0], FREQUENCY_VALUES[1], FREQUENCY_VALUES[2], FREQUENCY_VALUES[3]]),
  interval: z.coerce.number().int().min(1).max(365).default(1),
  startDate: dateSchema,
  endDate: optionalDateSchema,
  maxExecutions: z.coerce.number().int().min(1).max(240).optional(),
  autoAdjustDay: z.boolean().optional(),
})

const CreateRecurringSchema = RecurringBaseSchema

const UpdateRecurringSchema = RecurringBaseSchema.partial()
  .extend({
    isActive: z.boolean().optional(),
    startDate: optionalDateSchema,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Nenhum dado para atualizar',
  })

const toDateOnly = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))

const addDays = (date, amount) => {
  const base = toDateOnly(date)
  const result = new Date(base)
  result.setUTCDate(result.getUTCDate() + amount)
  return toDateOnly(result)
}

const addMonthsClamped = (date, monthsToAdd, autoAdjustDay = true) => {
  const base = toDateOnly(date)
  const year = base.getUTCFullYear()
  const month = base.getUTCMonth()
  const day = base.getUTCDate()
  const targetMonthIndex = month + monthsToAdd
  const target = new Date(Date.UTC(year, targetMonthIndex, 1))
  const daysInTargetMonth = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate()

  if (!autoAdjustDay && day > daysInTargetMonth) {
    return null
  }

  const clampedDay = autoAdjustDay ? Math.min(day, daysInTargetMonth) : day
  return new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), clampedDay))
}

const computeNextOccurrence = (current, frequency, interval, autoAdjustDay) => {
  if (!current) return null
  switch (frequency) {
    case 'daily':
      return addDays(current, interval)
    case 'weekly':
      return addDays(current, interval * 7)
    case 'monthly':
      return addMonthsClamped(current, interval, autoAdjustDay)
    case 'yearly':
      return addMonthsClamped(current, interval * 12, autoAdjustDay)
    default:
      return null
  }
}

const computeInitialNextRun = ({ startDate, frequency, interval, autoAdjustDay, endDate }) => {
  if (!startDate) return null
  const today = toDateOnly(new Date())
  let current = toDateOnly(startDate)

  if (endDate && current > endDate) {
    return null
  }

  // Garantir que a próxima execução seja pelo menos o startDate
  while (current && current < today) {
    const nextCandidate = computeNextOccurrence(current, frequency, interval, autoAdjustDay)
    if (!nextCandidate) return null
    if (endDate && nextCandidate > endDate) {
      return current
    }
    if (nextCandidate <= today) {
      current = nextCandidate
      continue
    }
    return current
  }
  return current
}

const serializeRecurring = (recurring) => ({
  id: recurring.id,
  descricao: recurring.descricao,
  valor: Number(recurring.valor),
  tipo: recurring.tipo,
  status: recurring.status,
  categoria: recurring.categoria,
  accountId: recurring.accountId,
  categoryId: recurring.categoryId,
  userId: recurring.userId,
  frequency: recurring.frequency,
  interval: recurring.interval,
  startDate: recurring.startDate?.toISOString().slice(0, 10) ?? null,
  endDate: recurring.endDate?.toISOString().slice(0, 10) ?? null,
  nextRun: recurring.nextRun?.toISOString().slice(0, 10) ?? null,
  lastRun: recurring.lastRun?.toISOString() ?? null,
  maxExecutions: recurring.maxExecutions ?? null,
  executedCount: recurring.executedCount,
  autoAdjustDay: recurring.autoAdjustDay,
  isActive: recurring.isActive,
  observacao: recurring.observacao ?? null,
  createdAt: recurring.createdAt.toISOString(),
  updatedAt: recurring.updatedAt.toISOString(),
  account: recurring.account
    ? {
        id: recurring.account.id,
        name: recurring.account.name,
        color: recurring.account.color,
        isDefault: recurring.account.isDefault,
        archivedAt: recurring.account.archivedAt ? recurring.account.archivedAt.toISOString() : null,
      }
    : undefined,
  category: recurring.category
    ? {
        id: recurring.category.id,
        name: recurring.category.name,
        color: recurring.category.color,
      }
    : undefined,
})

const ensureAccountForUser = async (userId, accountId) => {
  const account = await prisma.account.findFirst({ where: { id: accountId, userId } })
  if (!account) {
    throw Object.assign(new Error('Conta não encontrada'), { status: 404 })
  }
  if (account.archivedAt) {
    throw Object.assign(new Error('Conta arquivada não aceita recorrências'), { status: 409 })
  }
  return account
}

const resolveCategory = async (userId, data) => {
  let categoriaNome = data.categoria?.trim()
  let categoriaId = data.categoryId ?? null

  if (categoriaId) {
    const category = await prisma.category.findFirst({ where: { id: categoriaId, userId } })
    if (!category) {
      throw Object.assign(new Error('Categoria não encontrada'), { status: 404 })
    }
    categoriaNome = category.name
  }

  if (!categoriaNome) {
    categoriaNome = 'Outros'
  }

  return { categoriaNome: categoriaNome.slice(0, 80), categoriaId }
}

const computeOccurrencesToExecute = (recurring, referenceDate = new Date()) => {
  const occurrences = []
  if (!recurring.isActive || !recurring.nextRun) {
    return occurrences
  }

  const today = toDateOnly(referenceDate)
  const autoAdjustDay = recurring.autoAdjustDay !== false
  let nextDate = toDateOnly(recurring.nextRun)
  const endDate = recurring.endDate ? toDateOnly(recurring.endDate) : null
  let runs = 0

  while (nextDate && nextDate <= today && runs < MAX_OCCURRENCES_PER_RUN) {
    if (recurring.maxExecutions && recurring.executedCount + runs >= recurring.maxExecutions) {
      break
    }

    occurrences.push(nextDate)
    runs += 1

    const following = computeNextOccurrence(nextDate, recurring.frequency, recurring.interval, autoAdjustDay)
    if (!following) {
      nextDate = null
      break
    }

    if (endDate && following > endDate) {
      nextDate = null
      break
    }

    nextDate = following
  }

  return occurrences
}

const applyExecutionResults = (recurring, occurrences) => {
  if (!occurrences.length) return { nextRun: recurring.nextRun, executedCount: recurring.executedCount, isActive: recurring.isActive }

  const autoAdjustDay = recurring.autoAdjustDay !== false
  const endDate = recurring.endDate ? toDateOnly(recurring.endDate) : null
  let nextRun = computeNextOccurrence(occurrences[occurrences.length - 1], recurring.frequency, recurring.interval, autoAdjustDay)

  if (endDate && nextRun && nextRun > endDate) {
    nextRun = null
  }

  const totalExecuted = recurring.executedCount + occurrences.length
  let isActive = recurring.isActive
  if ((recurring.maxExecutions && totalExecuted >= recurring.maxExecutions) || !nextRun) {
    isActive = false
    nextRun = null
  }

  return {
    nextRun,
    executedCount: totalExecuted,
    isActive,
  }
}

const executeRecurring = async (recurring, userId, tx) => {
  const occurrences = computeOccurrencesToExecute(recurring)
  if (!occurrences.length) {
    return { created: 0 }
  }

  const account = await tx.account.findFirst({ where: { id: recurring.accountId, userId } })
  if (!account || account.archivedAt) {
    throw Object.assign(new Error('Conta associada não está disponível'), { status: 409 })
  }

  let categoriaNome = recurring.categoria
    const recurringCategoryId = Object.prototype.hasOwnProperty.call(recurring, 'categoryId') ? recurring.categoryId : null
    if (recurringCategoryId) {
    const category = await tx.category.findFirst({ where: { id: recurring.categoryId, userId } })
    if (!category) {
      categoriaNome = recurring.categoria ?? 'Outros'
    } else {
      categoriaNome = category.name
    }
  }

  const dataParaCriar = occurrences.map((dataExecucao) => ({
    accountId: recurring.accountId,
    descricao: recurring.descricao,
    categoria: categoriaNome || 'Outros',
      categoryId: recurringCategoryId ?? null,
    valor: recurring.valor,
    tipo: recurring.tipo,
    status: recurring.status,
    data: dataExecucao,
    observacao: recurring.observacao ?? null,
  }))

  await tx.transaction.createMany({ data: dataParaCriar })

  const { nextRun, executedCount, isActive } = applyExecutionResults(recurring, occurrences)

  await tx.recurringTransaction.update({
    where: { id: recurring.id },
    data: {
      nextRun,
      executedCount,
      isActive,
      lastRun: occurrences[occurrences.length - 1],
    },
  })

  const nextExecutionDate = nextRun ? nextRun.toISOString().slice(0, 10) : null
  const occurrencesDates = occurrences.map((date) => date.toISOString().slice(0, 10))
  const summary = occurrences.length > 1 ? `${occurrences.length} lançamentos foram gerados` : '1 lançamento foi gerado'
  const nextStepMessage = isActive && nextExecutionDate
    ? ` Próxima execução em ${nextExecutionDate}.`
    : ' Recorrência finalizada após esta execução.'

  await tx.notification.create({
    data: {
      userId,
      title: `Recorrência executada: ${recurring.descricao}`,
      message: `${summary} a partir da recorrência "${recurring.descricao}".${nextStepMessage}`,
      type: 'recurring',
      severity: 'success',
      metadata: {
        recurringId: recurring.id,
        occurrences: occurrencesDates,
        nextRun: nextExecutionDate,
        executedCount,
        isActive,
      },
    },
  })

  return { created: occurrences.length }
}

router.get('/', requireAuth, async (req, res) => {
  try {
    if (!hasModel(prisma, 'recurringTransaction')) {
      return res.json({ recurringTransactions: [] })
    }

    const recurringTransactions = await prisma.recurringTransaction.findMany({
      where: { userId: req.user.id },
      orderBy: [{ isActive: 'desc' }, { nextRun: 'asc' }],
      include: {
        account: { select: { id: true, name: true, color: true, isDefault: true, archivedAt: true } },
        category: { select: { id: true, name: true, color: true } },
      },
    })

    res.json({ recurringTransactions: recurringTransactions.map(serializeRecurring) })
  } catch (error) {
    console.error('List recurring transactions error:', error)
    res.status(500).json({ error: 'Falha ao listar transações recorrentes' })
  }
})

router.post('/', requireAuth, async (req, res) => {
  try {
    if (!hasModel(prisma, 'recurringTransaction')) {
      return res.status(404).json({ error: 'Recurso de transações recorrentes não disponível' })
    }
    const parsed = CreateRecurringSchema.parse(req.body)
    const autoAdjustDay = parsed.autoAdjustDay !== false

    await ensureAccountForUser(req.user.id, parsed.accountId)
    const { categoriaNome, categoriaId } = await resolveCategory(req.user.id, parsed)

    if (parsed.endDate && parsed.endDate < parsed.startDate) {
      return res.status(422).json({ error: 'Data final deve ser igual ou posterior à data inicial.' })
    }

    const nextRun = computeInitialNextRun({
      startDate: parsed.startDate,
      frequency: parsed.frequency,
      interval: parsed.interval,
      autoAdjustDay,
      endDate: parsed.endDate,
    })

    const created = await prisma.recurringTransaction.create({
      data: {
        descricao: parsed.descricao,
        valor: decimalFromNumber(parsed.valor),
        tipo: parsed.tipo,
        status: parsed.status,
        categoria: categoriaNome,
        categoryId: categoriaId,
        observacao: parsed.observacao?.trim() || null,
        accountId: parsed.accountId,
        userId: req.user.id,
        frequency: parsed.frequency,
        interval: parsed.interval,
        startDate: parsed.startDate,
        endDate: parsed.endDate ?? null,
        nextRun,
        maxExecutions: parsed.maxExecutions ?? null,
        autoAdjustDay,
      },
      include: {
        account: { select: { id: true, name: true, color: true, isDefault: true, archivedAt: true } },
        category: { select: { id: true, name: true, color: true } },
      },
    })

    res.status(201).json({ recurringTransaction: serializeRecurring(created) })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: 'Dados inválidos', issues: error.flatten() })
    }

    const status = error?.status ?? 500
    const message = error?.message ?? 'Falha ao criar transação recorrente'
    console.error('Create recurring transaction error:', error)
    res.status(status).json({ error: message })
  }
})

router.put('/:id', requireAuth, async (req, res) => {
  try {
    if (!hasModel(prisma, 'recurringTransaction')) {
      return res.status(404).json({ error: 'Recurso de transações recorrentes não disponível' })
    }
    const parsedId = Number(req.params.id)
    if (!Number.isInteger(parsedId)) {
      return res.status(400).json({ error: 'ID inválido' })
    }

    const parsed = UpdateRecurringSchema.parse(req.body)

    const existing = await prisma.recurringTransaction.findFirst({ where: { id: parsedId, userId: req.user.id } })
    if (!existing) {
      return res.status(404).json({ error: 'Transação recorrente não encontrada' })
    }

    if (parsed.accountId) {
      await ensureAccountForUser(req.user.id, parsed.accountId)
    }

    if (parsed.categoryId || parsed.categoria !== undefined) {
      const { categoriaNome, categoriaId } = await resolveCategory(req.user.id, parsed)
      parsed.categoria = categoriaNome
      parsed.categoryId = categoriaId
    }

    if (parsed.startDate && existing.lastRun && parsed.startDate > existing.lastRun) {
      const today = toDateOnly(new Date())
      if (parsed.startDate > today) {
        parsed.nextRun = parsed.startDate
      }
    }

    if (parsed.endDate && parsed.startDate && parsed.endDate < parsed.startDate) {
      return res.status(422).json({ error: 'Data final deve ser igual ou posterior à data inicial.' })
    }

    if (parsed.endDate && existing.startDate && parsed.endDate < existing.startDate) {
      return res.status(422).json({ error: 'Data final deve ser igual ou posterior à data inicial.' })
    }

    const autoAdjustDay = parsed.autoAdjustDay !== undefined ? parsed.autoAdjustDay : existing.autoAdjustDay
    let nextRun = existing.nextRun

    if (parsed.startDate || parsed.frequency || parsed.interval || parsed.autoAdjustDay || parsed.endDate) {
      const startReference = parsed.startDate ?? existing.startDate
      const frequency = parsed.frequency ?? existing.frequency
      const interval = parsed.interval ?? existing.interval
      const endDate = parsed.endDate ?? existing.endDate
      const normalizedEndDate = endDate ? toDateOnly(endDate) : null

      nextRun = computeInitialNextRun({
        startDate: startReference,
        frequency,
        interval,
        autoAdjustDay,
        endDate: normalizedEndDate,
      })
    }

    const updateData = {
      descricao: parsed.descricao ?? existing.descricao,
  valor: parsed.valor !== undefined ? decimalFromNumber(parsed.valor) : existing.valor,
      tipo: parsed.tipo ?? existing.tipo,
      status: parsed.status ?? existing.status,
      categoria: parsed.categoria ?? existing.categoria,
      categoryId: parsed.categoryId ?? existing.categoryId,
      observacao: parsed.observacao !== undefined ? (parsed.observacao?.trim() || null) : existing.observacao,
      accountId: parsed.accountId ?? existing.accountId,
      frequency: parsed.frequency ?? existing.frequency,
      interval: parsed.interval ?? existing.interval,
      startDate: parsed.startDate ?? existing.startDate,
  endDate: parsed.endDate ?? existing.endDate,
      nextRun,
      maxExecutions: parsed.maxExecutions ?? existing.maxExecutions,
      autoAdjustDay,
      isActive: parsed.isActive ?? existing.isActive,
    }

    if (updateData.nextRun === null) {
      updateData.isActive = false
    }

    const updated = await prisma.recurringTransaction.update({
      where: { id: parsedId },
      data: updateData,
      include: {
        account: { select: { id: true, name: true, color: true, isDefault: true, archivedAt: true } },
        category: { select: { id: true, name: true, color: true } },
      },
    })

    res.json({ recurringTransaction: serializeRecurring(updated) })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: 'Dados inválidos', issues: error.flatten() })
    }

    const status = error?.status ?? 500
    const message = error?.message ?? 'Falha ao atualizar transação recorrente'
    console.error('Update recurring transaction error:', error)
    res.status(status).json({ error: message })
  }
})

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    if (!hasModel(prisma, 'recurringTransaction')) {
      return res.status(404).json({ error: 'Recurso de transações recorrentes não disponível' })
    }
    const parsedId = Number(req.params.id)
    if (!Number.isInteger(parsedId)) {
      return res.status(400).json({ error: 'ID inválido' })
    }

    const existing = await prisma.recurringTransaction.findFirst({ where: { id: parsedId, userId: req.user.id } })
    if (!existing) {
      return res.status(404).json({ error: 'Transação recorrente não encontrada' })
    }

    await prisma.recurringTransaction.update({
      where: { id: parsedId },
      data: {
        isActive: false,
        nextRun: null,
      },
    })

    res.status(204).send()
  } catch (error) {
    console.error('Delete recurring transaction error:', error)
    res.status(500).json({ error: 'Falha ao remover transação recorrente' })
  }
})

router.post('/:id/executar', requireAuth, async (req, res) => {
  try {
    const parsedId = Number(req.params.id)
    if (!Number.isInteger(parsedId)) {
      return res.status(400).json({ error: 'ID inválido' })
    }
    if (!hasModel(prisma, 'recurringTransaction')) {
      return res.json({ processed: 0 })
    }

    const recurring = await prisma.recurringTransaction.findFirst({ where: { id: parsedId, userId: req.user.id } })
    if (!recurring) {
      return res.status(404).json({ error: 'Transação recorrente não encontrada' })
    }

    const result = await prisma.$transaction(async (tx) => executeRecurring(recurring, req.user.id, tx))

    res.json({ processed: result.created })
  } catch (error) {
    const status = error?.status ?? 500
    const message = error?.message ?? 'Falha ao processar transação recorrente'
    console.error('Execute recurring transaction error:', error)
    res.status(status).json({ error: message })
  }
})

router.post('/processar', requireAuth, async (req, res) => {
  try {
    if (!hasModel(prisma, 'recurringTransaction')) {
      return res.json({ processed: 0 })
    }

    const dueRecurring = await prisma.recurringTransaction.findMany({
      where: {
        userId: req.user.id,
        isActive: true,
        nextRun: { lte: toDateOnly(new Date()) },
      },
    })

    if (!dueRecurring.length) {
      return res.json({ processed: 0 })
    }

    let totalCreated = 0
    await prisma.$transaction(async (tx) => {
      for (const recurring of dueRecurring) {
        const result = await executeRecurring(recurring, req.user.id, tx)
        totalCreated += result.created
      }
    })

    res.json({ processed: totalCreated })
  } catch (error) {
    console.error('Process recurring transactions error:', error)
    res.status(500).json({ error: 'Falha ao processar transações recorrentes' })
  }
})

export default router
