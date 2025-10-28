import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import prisma from '../lib/prisma.js'
import { generateNotifications } from '../jobs/notifications.js'

const router = Router()

const NOTIFICATION_TYPES = [
  'system',
  'transaction',
  'recurring',
  'budget',
  'goal',
  'reminder',
  'BUDGET_THRESHOLD',
  'DEBT_DUE',
  'GOAL_REACHED',
]
const NOTIFICATION_SEVERITIES = ['info', 'success', 'warning', 'error']

const optionalPositiveInt = z.preprocess(
  (value) => (value === undefined || value === '' ? undefined : value),
  z.coerce.number().int().min(1).optional()
)

const optionalString = (max) =>
  z.preprocess(
    (value) => {
      if (value === undefined || value === null) return undefined
      if (typeof value !== 'string') return value
      const trimmed = value.trim()
      return trimmed.length ? trimmed : undefined
    },
    z.string().max(max).optional()
  )

const parseMetadata = (input) => {
  if (input === undefined || input === null || input === '') return undefined
  if (typeof input === 'string') {
    const trimmed = input.trim()
    if (!trimmed) return undefined
    try {
      return JSON.parse(trimmed)
    } catch (error) {
      throw new Error('Metadata inválido, use JSON válido')
    }
  }
  if (typeof input === 'object') return input
  throw new Error('Metadata deve ser um objeto ou JSON válido')
}

const CreateNotificationSchema = z.object({
  title: z.string().trim().min(3).max(120),
  message: z.string().trim().min(3).max(500),
  type: z.enum(NOTIFICATION_TYPES).default('system'),
  severity: z.enum(NOTIFICATION_SEVERITIES).default('info'),
  actionUrl: optionalString(255),
  expiresAt: z
    .preprocess((value) => (value === undefined || value === null || value === '' ? undefined : value), z.coerce.date().optional()),
})

const ListNotificationSchema = z.object({
  status: z.enum(['all', 'read', 'unread']).default('all'),
  page: optionalPositiveInt,
  perPage: optionalPositiveInt,
})

const serializeNotification = (notification) => ({
  id: notification.id,
  title: notification.title,
  message: notification.message,
  type: notification.type,
  severity: notification.severity,
  actionUrl: notification.actionUrl ?? null,
  metadata: notification.metadata ?? null,
  read: notification.readAt != null,
  readAt: notification.readAt ? notification.readAt.toISOString() : null,
  expiresAt: notification.expiresAt ? notification.expiresAt.toISOString() : null,
  createdAt: notification.createdAt.toISOString(),
  updatedAt: notification.updatedAt.toISOString(),
})

const NotificationPrefsSchema = z.object({
  emailEnabled: z.boolean().optional(),
  budgetThreshold: z
    .preprocess((value) => (value === undefined || value === null || value === '' ? undefined : value), z.coerce.number().min(0).max(1).optional()),
  debtDaysBefore: z
    .preprocess((value) => (value === undefined || value === null || value === '' ? undefined : value), z.coerce.number().int().min(0).max(60).optional()),
  bigTxThreshold: z
    .preprocess((value) => (value === undefined || value === null || value === '' ? undefined : value), z.coerce.number().min(0).optional()),
})

router.get('/', requireAuth, async (req, res) => {
  try {
    const { status = 'all', page, perPage } = ListNotificationSchema.parse(req.query)

    const where = { userId: req.user.id }
    if (status === 'unread') {
      where.readAt = null
    } else if (status === 'read') {
      where.readAt = { not: null }
    }

    const total = await prisma.notification.count({ where })
    const unreadCount = await prisma.notification.count({ where: { userId: req.user.id, readAt: null } })

    const shouldPaginate = page !== undefined || perPage !== undefined
    const currentPage = shouldPaginate ? page ?? 1 : 1
    const size = shouldPaginate ? Math.min(perPage ?? 20, 100) : total || 0
    const skip = shouldPaginate ? (currentPage - 1) * size : undefined
    const take = shouldPaginate ? size : undefined

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: [{ readAt: 'asc' }, { createdAt: 'desc' }],
      skip,
      take,
    })

    res.json({
      notifications: notifications.map(serializeNotification),
      meta: {
        total,
        page: currentPage,
        perPage: shouldPaginate ? size : total || notifications.length,
        totalPages: shouldPaginate ? Math.max(Math.ceil(total / (size || 1)), 1) : 1,
        unreadCount,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: 'Filtros inválidos', issues: error.flatten() })
    }
    console.error('List notifications error:', error)
    return res.status(500).json({ error: 'Falha ao listar notificações' })
  }
})

router.post('/', requireAuth, async (req, res) => {
  try {
    const parsed = CreateNotificationSchema.parse(req.body)
    let metadata = undefined
    try {
      metadata = parseMetadata(req.body?.metadata)
    } catch (error) {
      return res.status(422).json({ error: error.message })
    }

    const created = await prisma.notification.create({
      data: {
        userId: req.user.id,
        title: parsed.title,
        message: parsed.message,
        type: parsed.type ?? 'system',
        severity: parsed.severity ?? 'info',
        actionUrl: parsed.actionUrl ?? null,
        metadata: metadata ?? Prisma.JsonNull,
        expiresAt: parsed.expiresAt ?? null,
      },
    })

    res.status(201).json({ notification: serializeNotification(created) })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: 'Dados inválidos', issues: error.flatten() })
    }
    console.error('Create notification error:', error)
    return res.status(500).json({ error: 'Falha ao criar notificação' })
  }
})

router.post('/mark-all-read', requireAuth, async (req, res) => {
  try {
    const result = await prisma.notification.updateMany({
      where: { userId: req.user.id, readAt: null },
      data: { readAt: new Date() },
    })

    res.json({ updated: result.count })
  } catch (error) {
    console.error('Mark all notifications read error:', error)
    res.status(500).json({ error: 'Falha ao marcar notificações como lidas' })
  }
})

router.post('/:id/read', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'ID inválido' })
    }

    const existing = await prisma.notification.findFirst({ where: { id, userId: req.user.id } })
    if (!existing) {
      return res.status(404).json({ error: 'Notificação não encontrada' })
    }

    if (existing.readAt) {
      return res.json({ notification: serializeNotification(existing) })
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    })

    res.json({ notification: serializeNotification(updated) })
  } catch (error) {
    console.error('Mark notification read error:', error)
    res.status(500).json({ error: 'Falha ao marcar notificação como lida' })
  }
})

router.post('/:id/unread', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'ID inválido' })
    }

    const existing = await prisma.notification.findFirst({ where: { id, userId: req.user.id } })
    if (!existing) {
      return res.status(404).json({ error: 'Notificação não encontrada' })
    }

    if (!existing.readAt) {
      return res.json({ notification: serializeNotification(existing) })
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { readAt: null },
    })

    res.json({ notification: serializeNotification(updated) })
  } catch (error) {
    console.error('Mark notification unread error:', error)
    res.status(500).json({ error: 'Falha ao marcar notificação como não lida' })
  }
})

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'ID inválido' })
    }

    const existing = await prisma.notification.findFirst({ where: { id, userId: req.user.id } })
    if (!existing) {
      return res.status(404).json({ error: 'Notificação não encontrada' })
    }

    await prisma.notification.delete({ where: { id } })
    res.status(204).send()
  } catch (error) {
    console.error('Delete notification error:', error)
    res.status(500).json({ error: 'Falha ao remover notificação' })
  }
})

router.get('/prefs', requireAuth, async (req, res) => {
  try {
    const pref = await prisma.notificationPref.upsert({
      where: { userId: req.user.id },
      update: {},
      create: { userId: req.user.id },
    })
    res.json(pref)
  } catch (error) {
    console.error('Get notification prefs error:', error)
    res.status(500).json({ error: 'Falha ao carregar preferências' })
  }
})

router.put('/prefs', requireAuth, async (req, res) => {
  try {
    const parsed = NotificationPrefsSchema.parse(req.body ?? {})
    const data = {}
    if (parsed.emailEnabled !== undefined) data.emailEnabled = parsed.emailEnabled
    if (parsed.budgetThreshold !== undefined) data.budgetThreshold = new Prisma.Decimal(parsed.budgetThreshold.toFixed(2))
    if (parsed.debtDaysBefore !== undefined) data.debtDaysBefore = parsed.debtDaysBefore
    if (parsed.bigTxThreshold !== undefined) data.bigTxThreshold = new Prisma.Decimal(parsed.bigTxThreshold.toFixed(2))

    if (!Object.keys(data).length) {
      return res.status(422).json({ error: 'Nenhum dado para atualizar' })
    }

    const pref = await prisma.notificationPref.upsert({
      where: { userId: req.user.id },
      update: data,
      create: { userId: req.user.id, ...data },
    })

    res.json(pref)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: 'Dados inválidos', issues: error.flatten() })
    }
    console.error('Update notification prefs error:', error)
    res.status(500).json({ error: 'Falha ao salvar preferências' })
  }
})

router.post('/run-now', requireAuth, async (_req, res) => {
  try {
    await generateNotifications()
    res.json({ ok: true })
  } catch (error) {
    console.error('Run notifications job error:', error)
    res.status(500).json({ error: 'Falha ao executar notificações' })
  }
})

export default router
