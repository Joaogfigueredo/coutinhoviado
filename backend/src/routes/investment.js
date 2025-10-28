import { Router } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

const AnswersSchema = z.object({
  horizonte: z.enum(['curto', 'medio', 'longo']).optional(),
  tolerancia: z
    .preprocess((value) => (value === undefined || value === null || value === '' ? undefined : value), z.coerce.number().int().min(0).max(5))
    .optional(),
  renda: z.enum(['estavel', 'variavel']).optional(),
  experiencia: z
    .preprocess((value) => (value === undefined || value === null || value === '' ? undefined : value), z.coerce.number().int().min(0).max(3))
    .optional(),
})

function scoreAnswers(answers) {
  const a = answers ?? {}
  let score = 0
  if (a.horizonte === 'longo') score += 4
  else if (a.horizonte === 'medio') score += 2
  score += Number(a.tolerancia ?? 0)
  if (a.renda === 'estavel') score += 1
  score += Number(a.experiencia ?? 0)
  return score
}

function toProfile(score) {
  if (score <= 6) return 'CONSERVADOR'
  if (score <= 10) return 'MODERADO'
  return 'ARROJADO'
}

router.get('/profile', async (req, res, next) => {
  try {
    const row = await prisma.riskProfileResult.findUnique({ where: { userId: req.user.id } })
    res.json(row || null)
  } catch (error) {
    next(error)
  }
})

router.post('/profile', async (req, res, next) => {
  try {
    const answers = AnswersSchema.parse(req.body ?? {})
    const score = scoreAnswers(answers)
    const profile = toProfile(score)

    const saved = await prisma.riskProfileResult.upsert({
      where: { userId: req.user.id },
      update: { answers, score, profile },
      create: { userId: req.user.id, answers, score, profile },
    })

    res.status(201).json(saved)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: 'Dados inválidos', issues: error.flatten() })
    }
    next(error)
  }
})

router.get('/guides', async (_req, res) => {
  res.json({
    CONSERVADOR: { foco: ['renda fixa', 'caixa'], leitura: ['conceitos de risco', 'inflação x juros'] },
    MODERADO: { foco: ['mix renda fixa/variável'], leitura: ['diversificação', 'rebalanceamento'] },
    ARROJADO: { foco: ['renda variável', 'volatilidade'], leitura: ['gestão de risco', 'horizonte de investimento'] },
  })
})

export default router
