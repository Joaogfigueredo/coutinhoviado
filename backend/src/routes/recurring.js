import { Router } from 'express'
import { Prisma } from '@prisma/client'
import prisma from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import { processRecurringRules } from '../jobs/processRecurring.js'

const router = Router()

const hasModel = (client, modelName) => {
  const model = client?.[modelName]
  return !!model && (typeof model.findMany === 'function' || typeof model.findFirst === 'function' || typeof model.findUnique === 'function')
}

router.use(requireAuth)

const allowedFreq = new Set(['DAILY', 'WEEKLY', 'MONTHLY'])
const allowedTipo = new Set(['receita', 'despesa'])

function startOfDay(date) {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

function alignDateToMonthDay(date, day) {
  if (day == null) return date
  const result = new Date(date)
  const monthLength = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate()
  result.setDate(Math.min(day, monthLength))
  return result
}

function alignDateToWeekday(date, weekday) {
  if (weekday == null) return date
  const result = new Date(date)
  const current = result.getDay()
  const diff = (weekday + 7 - current) % 7
  if (diff === 0) return result
  result.setDate(result.getDate() + diff)
  return result
}

router.get('/', async (req, res, next) => {
  try {
    if (!hasModel(prisma, 'recurringRule')) {
      return res.json([])
    }
    const items = await prisma.recurringRule.findMany({ where: { userId: req.user.id }, orderBy: { nextRunAt: 'asc' } })
    res.json(items)
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    if (!hasModel(prisma, 'recurringRule')) {
      return res.status(404).json({ error: 'Recurso de regras recorrentes não disponível' })
    }
    const { accountId, tipo, categoria, valor, freq, dayOfMonth, dayOfWeek, firstRunAt } = req.body

    if (!tipo || !allowedTipo.has(String(tipo).toLowerCase())) {
      return res.status(422).json({ error: 'Tipo inválido' })
    }

    const freqValue = String(freq || '').toUpperCase()
    if (!allowedFreq.has(freqValue)) {
      return res.status(422).json({ error: 'Frequência inválida' })
    }

    const numericValor = Number(valor)
    if (!Number.isFinite(numericValor) || numericValor <= 0) {
      return res.status(422).json({ error: 'Valor inválido' })
    }

    const account = await prisma.account.findFirst({ where: { id: Number(accountId), userId: req.user.id, archivedAt: null } })
    if (!account) {
      return res.status(404).json({ error: 'Conta inalcançável para recorrência' })
    }

    const nextRunInput = firstRunAt ? new Date(firstRunAt) : new Date()
    if (Number.isNaN(nextRunInput.getTime())) {
      return res.status(422).json({ error: 'Data inicial inválida' })
    }

    const parsedDayOfMonth = dayOfMonth != null ? Number(dayOfMonth) : null
    if (parsedDayOfMonth != null && (parsedDayOfMonth < 1 || parsedDayOfMonth > 28)) {
      return res.status(422).json({ error: 'Dia do mês deve estar entre 1 e 28' })
    }

    const parsedDayOfWeek = dayOfWeek != null ? Number(dayOfWeek) : null
    if (parsedDayOfWeek != null && (parsedDayOfWeek < 0 || parsedDayOfWeek > 6)) {
      return res.status(422).json({ error: 'Dia da semana deve estar entre 0 e 6' })
    }

    let nextRun = startOfDay(nextRunInput)
    if (freqValue === 'WEEKLY') {
      nextRun = alignDateToWeekday(nextRun, parsedDayOfWeek)
    }
    if (freqValue === 'MONTHLY') {
      nextRun = alignDateToMonthDay(nextRun, parsedDayOfMonth ?? nextRun.getDate())
    }

    const rule = await prisma.recurringRule.create({
      data: {
        userId: req.user.id,
        accountId: account.id,
        tipo: String(tipo).toLowerCase(),
  categoria: (categoria || 'Outros').toString().slice(0, 80),
  valor: new Prisma.Decimal(numericValor.toFixed(2)),
  freq: freqValue,
        dayOfMonth: parsedDayOfMonth,
        dayOfWeek: parsedDayOfWeek,
        nextRunAt: nextRun,
      },
    })

    res.status(201).json(rule)
  } catch (error) {
    next(error)
  }
})

router.post('/process-now', async (_req, res, next) => {
  try {
    await processRecurringRules()
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    if (!hasModel(prisma, 'recurringRule')) {
      return res.status(404).json({ error: 'Recurso de regras recorrentes não disponível' })
    }
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'ID inválido' })
    }

    const existing = await prisma.recurringRule.findFirst({ where: { id, userId: req.user.id } })
    if (!existing) {
      return res.status(404).json({ error: 'Regra não encontrada' })
    }

    const { categoria, valor, active, nextRunAt, dayOfMonth, dayOfWeek, freq } = req.body ?? {}
    const data = {}

    if (categoria !== undefined) data.categoria = categoria || 'Outros'
    if (valor !== undefined) {
      const numericValor = Number(valor)
      if (!Number.isFinite(numericValor) || numericValor <= 0) {
        return res.status(422).json({ error: 'Valor inválido' })
      }
      data.valor = new Prisma.Decimal(numericValor.toFixed(2))
    }
    if (typeof active === 'boolean') data.active = active
    if (nextRunAt) {
      const parsedDate = new Date(nextRunAt)
      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(422).json({ error: 'Próxima execução inválida' })
      }
      data.nextRunAt = startOfDay(parsedDate)
    }
    if (dayOfMonth !== undefined) {
      if (dayOfMonth === null || dayOfMonth === '') {
        data.dayOfMonth = null
      } else {
        const parsed = Number(dayOfMonth)
        if (!Number.isInteger(parsed) || parsed < 1 || parsed > 28) {
          return res.status(422).json({ error: 'Dia do mês deve estar entre 1 e 28' })
        }
        data.dayOfMonth = parsed
      }
    }
    if (dayOfWeek !== undefined) {
      if (dayOfWeek === null || dayOfWeek === '') {
        data.dayOfWeek = null
      } else {
        const parsed = Number(dayOfWeek)
        if (!Number.isInteger(parsed) || parsed < 0 || parsed > 6) {
          return res.status(422).json({ error: 'Dia da semana deve estar entre 0 e 6' })
        }
        data.dayOfWeek = parsed
      }
    }
    if (freq) {
      const freqValue = String(freq).toUpperCase()
      if (!allowedFreq.has(freqValue)) {
        return res.status(422).json({ error: 'Frequência inválida' })
      }
      data.freq = freqValue
    }

    if (!Object.keys(data).length) {
      return res.status(422).json({ error: 'Nenhum campo para atualizar' })
    }

    const effectiveFreq = (data.freq ?? existing.freq).toUpperCase()
    const effectiveDayOfMonth = data.dayOfMonth !== undefined ? data.dayOfMonth : existing.dayOfMonth
    const effectiveDayOfWeek = data.dayOfWeek !== undefined ? data.dayOfWeek : existing.dayOfWeek

    if (data.nextRunAt) {
      let aligned = data.nextRunAt
      if (effectiveFreq === 'WEEKLY') {
        aligned = alignDateToWeekday(aligned, effectiveDayOfWeek)
      } else if (effectiveFreq === 'MONTHLY') {
        aligned = alignDateToMonthDay(aligned, effectiveDayOfMonth ?? aligned.getDate())
      }
      data.nextRunAt = aligned
    } else if (existing.nextRunAt) {
      if (data.dayOfWeek !== undefined && effectiveFreq === 'WEEKLY') {
        data.nextRunAt = alignDateToWeekday(startOfDay(existing.nextRunAt), data.dayOfWeek)
      }
      if (data.dayOfMonth !== undefined && effectiveFreq === 'MONTHLY') {
        const targetDay = data.dayOfMonth ?? startOfDay(existing.nextRunAt).getDate()
        data.nextRunAt = alignDateToMonthDay(startOfDay(existing.nextRunAt), targetDay)
      }
    }

    const rule = await prisma.recurringRule.update({ where: { id }, data })
    res.json(rule)
  } catch (error) {
    next(error)
  }
})

export default router
