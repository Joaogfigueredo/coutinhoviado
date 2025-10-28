import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

const SettingsSchema = z.object({
  currency: z.string().trim().min(3).max(3).optional(),
  locale: z.string().trim().min(2).max(10).optional(),
  timezone: z.string().trim().min(3).max(50).optional(),
  notifyBudgetPct: z
    .preprocess((value) => (value === undefined || value === null || value === '' ? undefined : value), z.coerce.number().min(0).max(1).optional()),
  notifyDebtDays: z
    .preprocess((value) => (value === undefined || value === null || value === '' ? undefined : value), z.coerce.number().int().min(0).max(90).optional()),
})

router.get('/', async (req, res, next) => {
  try {
    const settings = await prisma.userSettings.upsert({
      where: { userId: req.user.id },
      update: {},
      create: { userId: req.user.id },
    })
    res.json(settings)
  } catch (error) {
    next(error)
  }
})

router.put('/', async (req, res, next) => {
  try {
    const parsed = SettingsSchema.parse(req.body ?? {})
    if (!Object.keys(parsed).length) {
      return res.status(422).json({ error: 'Nenhum dado para atualizar' })
    }

    const data = {}
    if (parsed.currency !== undefined) data.currency = parsed.currency.toUpperCase()
    if (parsed.locale !== undefined) data.locale = parsed.locale
    if (parsed.timezone !== undefined) data.timezone = parsed.timezone
    if (parsed.notifyBudgetPct !== undefined) {
      data.notifyBudgetPct = new Prisma.Decimal(parsed.notifyBudgetPct.toFixed(2))
    }
    if (parsed.notifyDebtDays !== undefined) data.notifyDebtDays = parsed.notifyDebtDays

    const settings = await prisma.userSettings.upsert({
      where: { userId: req.user.id },
      update: data,
      create: { userId: req.user.id, ...data },
    })

    res.json(settings)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: 'Dados inválidos', issues: error.flatten() })
    }
    next(error)
  }
})

export default router
