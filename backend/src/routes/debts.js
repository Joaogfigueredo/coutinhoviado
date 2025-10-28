import { Router } from 'express'
import { PrismaClient, Prisma } from '@prisma/client'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'

const prisma = new PrismaClient()
const router = Router()

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100

const decimalAmountSchema = z
  .union([z.string(), z.number()])
  .transform((value) => {
    if (typeof value === 'string') {
      const normalized = value.replace(/\s/g, '').replace(',', '.').trim()
      return Number(normalized)
    }
    return Number(value)
  })
  .pipe(z.number().finite())
  .transform((value) => new Prisma.Decimal((Math.round(value * 100) / 100).toFixed(2)))

const decimalRateSchema = z
  .union([z.string(), z.number()])
  .transform((value) => {
    if (value === null || value === undefined || value === '') return 0
    if (typeof value === 'string') {
      const normalized = value.replace(/\s/g, '').replace(',', '.').trim()
      return Number(normalized)
    }
    return Number(value)
  })
  .pipe(z.number().finite())
  .transform((value) => new Prisma.Decimal(Number(value).toFixed(6)))

const numericSchema = z
  .union([z.string(), z.number()])
  .transform((value) => {
    if (typeof value === 'string') {
      const normalized = value.replace(/\s/g, '').replace(',', '.').trim()
      return Number(normalized)
    }
    return Number(value)
  })
  .pipe(z.number().finite())

const CreateDebtSchema = z.object({
  title: z.string().trim().min(2).max(180),
  principal: decimalAmountSchema,
  interestRate: decimalRateSchema.optional(),
  installments: z.number().int().min(1).optional(),
  dueDate: z.union([z.string(), z.date()]).optional(),
})

const UpdateDebtSchema = z.object({
  title: z.string().trim().min(2).max(180).optional(),
  principal: decimalAmountSchema.optional(),
  interestRate: decimalRateSchema.optional(),
  installments: z.number().int().min(1).optional(),
  dueDate: z.union([z.string(), z.date()]).optional(),
  status: z.enum(['active', 'paid', 'defaulted']).optional(),
})

const SimulationSchema = z.object({
  monthlyBudget: numericSchema.refine((value) => value > 0, { message: 'Orçamento mensal deve ser maior que zero' }),
  strategy: z.enum(['snowball', 'avalanche']).default('snowball'),
  extraPayment: numericSchema.optional(),
  includePaid: z
    .preprocess((value) => {
      if (value === undefined || value === null || value === '') return undefined
      if (typeof value === 'boolean') return value
      if (typeof value === 'string') return value === 'true' || value === '1'
      return Boolean(value)
    }, z.boolean().optional())
    .optional(),
})

const serializeDebt = (debt) => ({
  id: debt.id,
  title: debt.title,
  principal: Number(debt.principal ?? 0),
  interestRate: Number(debt.interestRate ?? 0),
  installments: debt.installments,
  dueDate: debt.dueDate ? debt.dueDate.toISOString().slice(0, 10) : null,
  status: debt.status,
  createdAt: debt.createdAt.toISOString(),
  updatedAt: debt.updatedAt.toISOString(),
})

router.get('/', requireAuth, async (req, res) => {
  try {
    const debts = await prisma.debt.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } })
    res.json({ debts: debts.map(serializeDebt) })
  } catch (error) {
    console.error('List debts error:', error)
    res.status(500).json({ error: 'Falha ao listar dívidas' })
  }
})

router.post('/', requireAuth, async (req, res) => {
  try {
    const payload = CreateDebtSchema.parse(req.body)
    const debt = await prisma.debt.create({
      data: {
        title: payload.title,
        principal: payload.principal,
        interestRate: payload.interestRate ?? new Prisma.Decimal('0'),
        installments: payload.installments ?? 1,
        dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
        userId: req.user.id,
      },
    })
    res.status(201).json({ debt: serializeDebt(debt) })
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(422).json({ error: 'Dados inválidos', issues: error.flatten() })
    console.error('Create debt error:', error)
    res.status(500).json({ error: 'Falha ao criar dívida' })
  }
})

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'ID inválido' })
    const payload = UpdateDebtSchema.parse(req.body)

    const existing = await prisma.debt.findFirst({ where: { id, userId: req.user.id } })
    if (!existing) return res.status(404).json({ error: 'Dívida não encontrada' })

    const data = {
      title: payload.title ?? undefined,
      principal: payload.principal ?? undefined,
      interestRate: payload.interestRate ?? undefined,
      installments: payload.installments ?? undefined,
      dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined,
      status: payload.status ?? undefined,
    }

    const updated = await prisma.debt.update({ where: { id }, data })
    res.json({ debt: serializeDebt(updated) })
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(422).json({ error: 'Dados inválidos', issues: error.flatten() })
    console.error('Update debt error:', error)
    res.status(500).json({ error: 'Falha ao atualizar dívida' })
  }
})

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'ID inválido' })
    const existing = await prisma.debt.findFirst({ where: { id, userId: req.user.id } })
    if (!existing) return res.status(404).json({ error: 'Dívida não encontrada' })
    await prisma.debt.delete({ where: { id } })
    res.status(204).send()
  } catch (error) {
    console.error('Delete debt error:', error)
    res.status(500).json({ error: 'Falha ao remover dívida' })
  }
})

function sortDebts(debts, strategy) {
  const cloned = debts.slice()
  if (strategy === 'avalanche') {
    cloned.sort((a, b) => {
      if (b.rate === a.rate) return b.balance - a.balance
      return b.rate - a.rate
    })
  } else {
    cloned.sort((a, b) => {
      if (a.balance === b.balance) return b.rate - a.rate
      return a.balance - b.balance
    })
  }
  return cloned
}

function simulateDebts(debts, strategy, monthlyBudget) {
  if (!debts.length) {
    return {
      summary: {
        months: 0,
        totalPrincipal: 0,
        totalInterestPaid: 0,
        totalPaid: 0,
        strategy,
        monthlyBudget,
      },
      payoffOrder: [],
      timeline: [],
    }
  }

  const working = debts.map((debt) => ({
    id: debt.id,
    title: debt.title,
    balance: round2(debt.balance),
    rate: debt.rate,
    status: debt.status,
    originalPrincipal: debt.balance,
    totalPaid: 0,
  }))

  const sortedDebts = sortDebts(working, strategy)
  const payoffOrder = []
  const timeline = []
  let totalInterest = 0
  let totalPaid = 0
  let month = 0

  const maxIterations = 600

  while (sortedDebts.some((debt) => debt.balance > 0)) {
    if (month >= maxIterations) {
      throw new Error('A simulação excedeu 50 anos. Ajuste o orçamento mensal ou reveja os dados das dívidas.')
    }

    month += 1
    let available = monthlyBudget
    const payments = []

    for (const debt of sortedDebts) {
      if (debt.balance <= 0) continue
      if (available <= 0) break

      const interest = round2(debt.balance * debt.rate)
      debt.balance = round2(debt.balance + interest)
      totalInterest += interest

      const payment = round2(Math.min(debt.balance, available))

      if (payment <= interest && debt.balance > 0 && debt.rate > 0) {
        throw new Error('O orçamento mensal não é suficiente para cobrir os juros mensais atuais. Aumente o valor destinado às dívidas.')
      }

      debt.balance = round2(debt.balance - payment)
      debt.totalPaid = round2(debt.totalPaid + payment)
      available = round2(available - payment)
      totalPaid = round2(totalPaid + payment)

      payments.push({
        debtId: debt.id,
        title: debt.title,
        payment,
        interestPaid: interest,
        principalPaid: round2(payment - interest),
        remaining: Math.max(debt.balance, 0),
      })

      if (debt.balance <= 0.01) {
        debt.balance = 0
        payoffOrder.push({
          debtId: debt.id,
          title: debt.title,
          month,
          totalPaid: round2(debt.totalPaid),
        })
      }
    }

    const remainingBalance = round2(sortedDebts.reduce((acc, debt) => acc + Math.max(debt.balance, 0), 0))
    timeline.push({
      month,
      payments,
      remainingBalance,
    })

    if (!payments.length) {
      throw new Error('Nenhum pagamento pôde ser aplicado com o orçamento informado. Revise os dados das dívidas.')
    }
  }

  const totalPrincipal = round2(debts.reduce((acc, debt) => acc + debt.balance, 0))
  return {
    summary: {
      months: timeline.length,
      totalPrincipal,
      totalInterestPaid: round2(totalInterest),
      totalPaid: round2(totalPaid),
      strategy,
      monthlyBudget,
    },
    payoffOrder,
    timeline,
  }
}

router.post('/simulate', requireAuth, async (req, res) => {
  try {
    const { monthlyBudget, strategy, extraPayment = 0, includePaid } = SimulationSchema.parse(req.body)
    const totalBudget = round2(monthlyBudget + (extraPayment || 0))

    if (totalBudget <= 0) {
      return res.status(422).json({ error: 'O orçamento mensal total deve ser maior que zero.' })
    }

    const debts = await prisma.debt.findMany({
      where: {
        userId: req.user.id,
        ...(includePaid ? {} : { status: { not: 'paid' } }),
      },
      orderBy: { createdAt: 'asc' },
    })

    const normalizedDebts = debts
      .map((debt) => ({
        id: debt.id,
        title: debt.title,
        balance: Number(debt.principal ?? 0),
        rate: Number(debt.interestRate ?? 0),
        status: debt.status,
      }))
      .filter((debt) => debt.balance > 0)

    if (!normalizedDebts.length) {
      return res.json({
        simulation: {
          summary: {
            months: 0,
            totalPrincipal: 0,
            totalInterestPaid: 0,
            totalPaid: 0,
            strategy,
            monthlyBudget: totalBudget,
          },
          payoffOrder: [],
          timeline: [],
          notes: 'Nenhuma dívida ativa encontrada para simular.',
        },
      })
    }

    const simulation = simulateDebts(normalizedDebts, strategy, totalBudget)
    res.json({ simulation })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: 'Dados inválidos', issues: error.flatten() })
    }
    console.error('Simulate debt payoff error:', error)
    res.status(422).json({ error: error.message ?? 'Falha ao simular amortização das dívidas' })
  }
})

export default router
