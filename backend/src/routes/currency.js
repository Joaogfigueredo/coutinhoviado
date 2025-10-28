import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

const RateSchema = z.object({
  base: z
    .string()
    .trim()
    .min(3)
    .max(3)
    .transform((value) => value.toUpperCase()),
  quote: z
    .string()
    .trim()
    .min(3)
    .max(3)
    .transform((value) => value.toUpperCase()),
  rate: z.preprocess((value) => (value === undefined || value === null || value === '' ? undefined : value), z.coerce.number().positive()),
})

router.get('/rates', async (_req, res, next) => {
  try {
    const rows = await prisma.fxRate.findMany({ orderBy: [{ base: 'asc' }, { quote: 'asc' }] })
    res.json(rows)
  } catch (error) {
    next(error)
  }
})

router.put('/rates', async (req, res, next) => {
  try {
    const { base, quote, rate } = RateSchema.parse(req.body ?? {})
    if (base === quote) {
      return res.status(422).json({ error: 'Par de moedas inválido' })
    }

    const normalizedRate = new Prisma.Decimal(rate.toFixed(6))
    const upserted = await prisma.fxRate.upsert({
      where: { base_quote: { base, quote } },
      update: { rate: normalizedRate },
      create: { base, quote, rate: normalizedRate },
    })

    res.json(upserted)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: 'Dados inválidos', issues: error.flatten() })
    }
    next(error)
  }
})

export default router
