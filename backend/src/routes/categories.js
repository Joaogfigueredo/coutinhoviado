// backend/src/routes/categories.js
import { Router } from 'express'
import { PrismaClient, Prisma } from '@prisma/client'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'

const prisma = new PrismaClient()
const router = Router()

const colorRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

const optionalColorSchema = z
  .preprocess((value) => (value === '' ? undefined : value), z.string().trim().regex(colorRegex, 'Cor inválida').optional())

const CreateCategorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  color: optionalColorSchema,
})

const UpdateCategorySchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  color: optionalColorSchema,
})

router.get('/', requireAuth, async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { userId: req.user.id },
      orderBy: [{ name: 'asc' }],
    })
    res.json({ categories })
  } catch (error) {
    console.error('List categories error:', error)
    res.status(500).json({ error: 'Falha ao listar categorias' })
  }
})

router.post('/', requireAuth, async (req, res) => {
  try {
    const payload = CreateCategorySchema.parse(req.body)

    const category = await prisma.category.create({
      data: {
        name: payload.name,
  color: payload.color ?? null,
        userId: req.user.id,
      },
    })

    res.status(201).json({ category })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: 'Dados inválidos', issues: error.flatten() })
    }

    if (error?.code === 'P2002') {
      return res.status(409).json({ error: 'Já existe uma categoria com esse nome' })
    }

    console.error('Create category error:', error)
    res.status(500).json({ error: 'Falha ao criar categoria' })
  }
})

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const categoryId = Number(req.params.id)
    if (!Number.isInteger(categoryId)) {
      return res.status(400).json({ error: 'ID inválido' })
    }

    const payload = UpdateCategorySchema.parse(req.body)
    if (!Object.keys(payload).length) {
      return res.status(422).json({ error: 'Nenhum dado para atualizar' })
    }

    const existing = await prisma.category.findFirst({ where: { id: categoryId, userId: req.user.id } })
    if (!existing) {
      return res.status(404).json({ error: 'Categoria não encontrada' })
    }

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: payload.name ?? undefined,
  color: payload.color ?? undefined,
      },
    })

    res.json({ category: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: 'Dados inválidos', issues: error.flatten() })
    }

    if (error?.code === 'P2002') {
      return res.status(409).json({ error: 'Já existe uma categoria com esse nome' })
    }

    console.error('Update category error:', error)
    res.status(500).json({ error: 'Falha ao atualizar categoria' })
  }
})

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const categoryId = Number(req.params.id)
    if (!Number.isInteger(categoryId)) {
      return res.status(400).json({ error: 'ID inválido' })
    }

    const existing = await prisma.category.findFirst({ where: { id: categoryId, userId: req.user.id } })
    if (!existing) {
      return res.status(404).json({ error: 'Categoria não encontrada' })
    }

    await prisma.$transaction([
      prisma.transaction.updateMany({
        where: { categoryId, account: { userId: req.user.id } },
        data: { categoryId: null },
      }),
      prisma.category.delete({ where: { id: categoryId } }),
    ])

    res.status(204).send()
  } catch (error) {
    console.error('Delete category error:', error)
    res.status(500).json({ error: 'Falha ao remover categoria' })
  }
})

export default router
