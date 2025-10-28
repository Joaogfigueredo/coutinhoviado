// backend/src/routes/accounts.js
import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import prisma from '../lib/prisma.js'

const router = Router()

const colorSchema = z.string().trim().min(1).max(20)
const currencySchema = z
  .string()
  .trim()
  .min(3)
  .max(3)
  .transform((value) => value.toUpperCase())
const balanceSchema = z
  .union([z.string(), z.number()])
  .transform((valor) => {
    if (typeof valor === 'string') {
      const normalized = valor.replace(',', '.').trim()
      if (!normalized) return 0
      return Number(normalized)
    }
    return valor
  })
  .pipe(z.number().finite())
  .refine((valor) => Number.isFinite(valor), 'Saldo inválido')
  .refine((valor) => Math.abs(valor) <= 1_000_000_000, 'Saldo excede o limite permitido')
  .transform((valor) => new Prisma.Decimal((Math.round(valor * 100) / 100).toFixed(2)))

const CreateAccountSchema = z.object({
  name: z.string().trim().min(2).max(60),
  color: colorSchema,
  isDefault: z.boolean().optional(),
  initialBalance: balanceSchema.optional(),
  currency: currencySchema.optional(),
})

const UpdateAccountSchema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  color: colorSchema.optional(),
  isDefault: z.boolean().optional(),
  initialBalance: balanceSchema.optional(),
  isArchived: z.boolean().optional(),
  currency: currencySchema.optional(),
})

const includeArchivedFlag = (value) => {
  if (value === undefined) return false
  if (typeof value === 'string') {
    return ['1', 'true', 'yes'].includes(value.toLowerCase())
  }
  return Boolean(value)
}

// Lista contas do usuário
router.get('/', requireAuth, async (req, res) => {
  try {
    const showArchived = includeArchivedFlag(req.query.includeArchived)
    const accounts = await prisma.account.findMany({
      where: {
        userId: req.user.id,
        ...(showArchived ? {} : { archivedAt: null }),
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    })

    res.json({ accounts, meta: { includeArchived: showArchived } })
  } catch (error) {
    console.error('List accounts error:', error)
    res.status(500).json({ error: 'Falha ao listar contas' })
  }
})

// Cria conta
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, color, isDefault, initialBalance, currency } = CreateAccountSchema.parse(req.body)
    const userId = req.user.id

    let account
    try {
      account = await prisma.$transaction(async (tx) => {
        const hasDefault = await tx.account.findFirst({ where: { userId, isDefault: true } })
        const makeDefault = isDefault ?? !hasDefault

        if (makeDefault) {
          await tx.account.updateMany({ where: { userId }, data: { isDefault: false } })
        }

        return tx.account.create({
          data: {
            name,
            color,
            isDefault: makeDefault,
            userId,
            initialBalance: initialBalance ?? new Prisma.Decimal('0'),
            archivedAt: null,
            deletedAt: null,
            currency: currency ?? 'BRL',
          },
        })
      })
    } catch (error) {
      // Se o schema não possui a coluna `currency`, tente recriar sem ela
      const isCurrencyFieldError =
        error?.message?.toLowerCase?.().includes('currency') || error?.code === 'P1012' || error instanceof Prisma.PrismaClientValidationError
      if (isCurrencyFieldError) {
        console.warn('Account create failed due to missing currency field, retrying without currency')
        account = await prisma.$transaction(async (tx) => {
          const hasDefault = await tx.account.findFirst({ where: { userId, isDefault: true } })
          const makeDefault = isDefault ?? !hasDefault

          if (makeDefault) {
            await tx.account.updateMany({ where: { userId }, data: { isDefault: false } })
          }

          return tx.account.create({
            data: {
              name,
              color,
              isDefault: makeDefault,
              userId,
              initialBalance: initialBalance ?? new Prisma.Decimal('0'),
              archivedAt: null,
              deletedAt: null,
              // omit currency
            },
          })
        })
      } else {
        throw error
      }
    }

    res.status(201).json({ account })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: 'Dados inválidos', issues: error.flatten() })
    }

    if (error?.code === 'P2002') {
      return res.status(409).json({ error: 'Já existe uma conta com esse nome' })
    }

    console.error('Create account error:', error)
    res.status(500).json({ error: 'Falha ao criar conta' })
  }
})

// Atualiza conta
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params
    const accountId = Number(id)
    if (!Number.isInteger(accountId)) {
      return res.status(400).json({ error: 'ID inválido' })
    }

    const parsed = UpdateAccountSchema.parse(req.body)
    if (!Object.keys(parsed).length) {
      return res.status(422).json({ error: 'Nenhum dado para atualizar' })
    }

    const existing = await prisma.account.findFirst({ where: { id: accountId, userId: req.user.id } })
    if (!existing) return res.status(404).json({ error: 'Conta não encontrada' })

    if (parsed.isDefault === true && parsed.isArchived === true) {
      return res.status(422).json({ error: 'Uma conta arquivada não pode ser padrão' })
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updateData = {}
      if (parsed.name !== undefined) updateData.name = parsed.name
      if (parsed.color !== undefined) updateData.color = parsed.color
      if (parsed.initialBalance !== undefined) updateData.initialBalance = parsed.initialBalance
      if (parsed.currency !== undefined) updateData.currency = parsed.currency

      if (parsed.isArchived === true) {
        updateData.archivedAt = new Date()
        updateData.isDefault = false
      } else if (parsed.isArchived === false) {
        updateData.archivedAt = null
      }

      const isArchivingNow = parsed.isArchived === true && !existing.archivedAt
      const isUnarchivingNow = parsed.isArchived === false && existing.archivedAt

      if (parsed.isDefault === true) {
        await tx.account.updateMany({ where: { userId: req.user.id, NOT: { id: accountId } }, data: { isDefault: false } })
        updateData.isDefault = true
      } else if (parsed.isDefault === false && existing.isDefault) {
        updateData.isDefault = false
      }

      let saved
      try {
        saved = await tx.account.update({ where: { id: accountId }, data: updateData })
      } catch (error) {
        // se falhar por causa do campo currency ausente, tente sem o campo
        const isCurrencyFieldError = error?.message?.toLowerCase?.().includes('currency') || error instanceof Prisma.PrismaClientValidationError
        if (isCurrencyFieldError) {
          console.warn('Account update failed due to missing currency field, retrying without currency')
          const { currency: _omit, ...updateWithoutCurrency } = updateData
          saved = await tx.account.update({ where: { id: accountId }, data: updateWithoutCurrency })
        } else {
          throw error
        }
      }

      if (isArchivingNow && existing.isDefault) {
        const fallback = await tx.account.findFirst({
          where: { userId: req.user.id, archivedAt: null, NOT: { id: accountId } },
          orderBy: { createdAt: 'asc' },
        })
        if (fallback) {
          await tx.account.update({ where: { id: fallback.id }, data: { isDefault: true } })
        }
      }

      if (isUnarchivingNow && saved.archivedAt === null && saved.isDefault === false) {
        const hasAnyDefault = await tx.account.findFirst({ where: { userId: req.user.id, isDefault: true, archivedAt: null } })
        if (!hasAnyDefault) {
          await tx.account.update({ where: { id: saved.id }, data: { isDefault: true } })
          saved = { ...saved, isDefault: true }
        }
      }

      return saved
    })

    res.json({ account: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: 'Dados inválidos', issues: error.flatten() })
    }

    if (error?.code === 'P2002') {
      return res.status(409).json({ error: 'Já existe uma conta com esse nome' })
    }

    console.error('Update account error:', error)
    res.status(500).json({ error: 'Falha ao atualizar conta' })
  }
})

// Remove conta
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params
    const accountId = Number(id)
    if (!Number.isInteger(accountId)) {
      return res.status(400).json({ error: 'ID inválido' })
    }

    const existing = await prisma.account.findFirst({ where: { id: accountId, userId: req.user.id } })
    if (!existing) return res.status(404).json({ error: 'Conta não encontrada' })

    await prisma.$transaction(async (tx) => {
      await tx.account.update({
        where: { id: accountId },
        data: { archivedAt: new Date(), isDefault: false },
      })

      const fallback = await tx.account.findFirst({
        where: { userId: req.user.id, archivedAt: null, NOT: { id: accountId } },
        orderBy: { createdAt: 'asc' },
      })

      if (fallback) {
        await tx.account.update({ where: { id: fallback.id }, data: { isDefault: true } })
      }
    })

    res.status(204).send()
  } catch (error) {
    console.error('Delete account error:', error)
    res.status(500).json({ error: 'Falha ao remover conta' })
  }
})

export default router
