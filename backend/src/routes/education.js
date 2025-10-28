import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import { withPrismaFallback, isSchemaOutOfSyncError } from '../lib/prismaSafe.js'

const router = Router()
router.use(requireAuth)

const ProgressSchema = z.object({
  lessonSlug: z.string().trim().min(2).max(120),
  completed: z.boolean(),
})

async function getPrisma() {
  const module = await import('../lib/prisma.js')
  return module.default
}

router.get('/progress', async (req, res, next) => {
  try {
    const prisma = await getPrisma()
    const rows = await withPrismaFallback(
      () => prisma.lessonProgress.findMany({
        where: { userId: req.user.id },
        orderBy: { lessonSlug: 'asc' },
      }),
      [],
    )
    res.json(rows)
  } catch (error) {
    next(error)
  }
})

router.post('/progress', async (req, res, next) => {
  try {
    const prisma = await getPrisma()
    const parsed = ProgressSchema.parse(req.body ?? {})
    const now = parsed.completed ? new Date() : null
    const row = await prisma.lessonProgress.upsert({
      where: { userId_lessonSlug: { userId: req.user.id, lessonSlug: parsed.lessonSlug } },
      update: { completed: parsed.completed, completedAt: now },
      create: { userId: req.user.id, lessonSlug: parsed.lessonSlug, completed: parsed.completed, completedAt: now },
    })
    res.status(201).json(row)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: 'Dados inválidos', issues: error.flatten() })
    }
    if (isSchemaOutOfSyncError(error)) {
      return res.status(503).json({
        error: 'Funcionalidade de progresso indisponível. Execute as migrations do banco de dados para criar a tabela necessária.',
      })
    }
    next(error)
  }
})

export default router
