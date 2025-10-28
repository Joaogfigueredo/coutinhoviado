import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import prisma from '../lib/prisma.js'
const router = Router()

const periodoSchema = z.enum(['3meses', '6meses', '1ano']).default('6meses')

const colorPalette = ['#8b5cf6', '#6366f1', '#a855f7', '#c084fc', '#22d3ee', '#34d399', '#facc15', '#fb7185']

const queryWithPeriodo = z.object({ periodo: periodoSchema.optional() })

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100
const round1 = (value) => Math.round((value + Number.EPSILON) * 10) / 10

const percentageChange = (current, previous) => {
  if (previous === 0) {
    if (current === 0) return 0
    return null
  }
  const delta = ((current - previous) / Math.abs(previous)) * 100
  return round1(delta)
}

const getPeriodRange = (periodo) => {
  const months = periodo === '3meses' ? 3 : periodo === '1ano' ? 12 : 6
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  const startMonth = new Date(end.getFullYear(), end.getMonth() - months + 1, 1)
  const start = new Date(startMonth.getFullYear(), startMonth.getMonth(), 1)
  return { start, end, months }
}

const getPreviousRange = ({ start, months }) => {
  const endPrev = new Date(start.getFullYear(), start.getMonth(), 0)
  endPrev.setHours(23, 59, 59, 999)
  const startPrev = new Date(endPrev.getFullYear(), endPrev.getMonth() - months + 1, 1)
  return { start: startPrev, end: endPrev, months }
}

const buildMonthBuckets = (end, months) => {
  const buckets = []
  for (let index = months - 1; index >= 0; index -= 1) {
    const date = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - index, 1))
    const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}`
    const label = date.toLocaleString('pt-BR', { month: 'short' })
    const formatted = label.charAt(0).toUpperCase() + label.slice(1)
    buckets.push({
      key,
      mes: formatted,
      ano: date.getUTCFullYear(),
      receitas: 0,
      despesas: 0,
    })
  }
  return buckets
}

const convertAmount = (amount, fromCurrency, baseCurrency, rateMap) => {
  const numeric = typeof amount === 'number' ? amount : Number(amount ?? 0)
  if (!Number.isFinite(numeric)) return 0
  const from = (fromCurrency || baseCurrency || 'BRL').toUpperCase()
  const base = (baseCurrency || 'BRL').toUpperCase()
  if (from === base) return numeric

  const forwardKey = `${from}:${base}`
  const backwardKey = `${base}:${from}`

  if (rateMap.has(forwardKey)) {
    return numeric * rateMap.get(forwardKey)
  }
  if (rateMap.has(backwardKey)) {
    const rate = rateMap.get(backwardKey)
    if (rate) return numeric / rate
  }
  return numeric
}

const serializeTotals = (transactions, baseCurrency, rateMap) =>
  transactions.reduce(
    (acc, tx) => {
      // hotfix: não confiar em account.currency (pode não existir no schema)
      const valor = convertAmount(tx.valor, baseCurrency, baseCurrency, rateMap)
      if (tx.tipo === 'receita') acc.receitas += valor
      else acc.despesas += valor
      return acc
    },
    { receitas: 0, despesas: 0 }
  )

const loadTransactions = (userId, range, { includeCategory = false } = {}) => {
  const baseSelect = {
    valor: true,
    tipo: true,
    categoria: true,
    categoryId: true,
    data: true,
  }

  const select = includeCategory
    ? { ...baseSelect, category: { select: { id: true, name: true, color: true } } }
    : baseSelect

  return prisma.transaction.findMany({
    where: {
      account: { userId },
      status: 'confirmado',
      ...(range
        ? {
            data: {
              gte: range.start,
              lte: range.end,
            },
          }
        : {}),
    },
    select,
  })
}

const buildCurrencyContext = async (maybePrisma, userId, queryBase) => {
  const client = maybePrisma || prisma

  let baseCurrency = 'BRL'
  if (queryBase) baseCurrency = String(queryBase).trim().toUpperCase()
  else {
    try {
      if (client?.userSettings && typeof client.userSettings.findUnique === 'function') {
        const settings = await client.userSettings.findUnique({ where: { userId }, select: { currency: true } })
        if (settings?.currency) baseCurrency = String(settings.currency).toUpperCase()
      }
    } catch (e) {
      // ignore and fallback to BRL
    }
  }

  const rateMap = new Map()
  try {
    if (client?.fxRate && typeof client.fxRate.findMany === 'function') {
      const rates = await client.fxRate.findMany({ select: { base: true, quote: true, rate: true } })
      rates
        .filter((r) => r?.base && r?.quote && Number.isFinite(Number(r.rate)))
        .forEach((r) => rateMap.set(`${String(r.base).toUpperCase()}:${String(r.quote).toUpperCase()}`, Number(r.rate)))
    }
  } catch (e) {
    // ignore and fallback
  }

  if (!rateMap.size && client?.currencyRate && typeof client.currencyRate.findFirst === 'function') {
    try {
      const r = await client.currencyRate.findFirst({ where: { base: baseCurrency }, orderBy: { createdAt: 'desc' } })
      if (r?.rates && typeof r.rates === 'object') {
        Object.entries(r.rates).forEach(([quote, value]) => {
          if (!quote || !Number.isFinite(Number(value))) return
          rateMap.set(`${String(baseCurrency).toUpperCase()}:${String(quote).toUpperCase()}`, Number(value))
        })
      }
    } catch (e) {
      // ignore
    }
  }

  if (!rateMap.size) rateMap.set(`${baseCurrency}:${baseCurrency}`, 1)

  return { baseCurrency, rateMap }
}

router.get('/totais', requireAuth, async (req, res) => {
  try {
    const { periodo = '6meses' } = queryWithPeriodo.parse(req.query)
    const range = getPeriodRange(periodo)
    const previousRange = getPreviousRange(range)
  const { baseCurrency, rateMap } = await buildCurrencyContext(prisma, req.user.id, req.query.base)

    const [currentTransactions, previousTransactions] = await Promise.all([
      loadTransactions(req.user.id, range),
      loadTransactions(req.user.id, previousRange),
    ])

    const currentTotalsRaw = serializeTotals(currentTransactions, baseCurrency, rateMap)
    const previousTotalsRaw = serializeTotals(previousTransactions, baseCurrency, rateMap)

    const currentTotals = {
      receitas: round2(currentTotalsRaw.receitas),
      despesas: round2(currentTotalsRaw.despesas),
    }
    const previousTotals = {
      receitas: round2(previousTotalsRaw.receitas),
      despesas: round2(previousTotalsRaw.despesas),
    }

    const saldoAtual = round2(currentTotals.receitas - currentTotals.despesas)
    const saldoAnterior = round2(previousTotals.receitas - previousTotals.despesas)

    res.json({
      baseCurrency,
      period: {
        periodo,
        inicio: range.start.toISOString(),
        fim: range.end.toISOString(),
      },
      totals: {
        receitas: {
          valor: currentTotals.receitas,
          variacaoPercentual: percentageChange(currentTotals.receitas, previousTotals.receitas),
        },
        despesas: {
          valor: currentTotals.despesas,
          variacaoPercentual: percentageChange(currentTotals.despesas, previousTotals.despesas),
        },
        saldo: {
          valor: saldoAtual,
          variacaoPercentual: percentageChange(saldoAtual, saldoAnterior),
        },
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: 'Parâmetros inválidos', issues: error.flatten() })
    }
    console.error('Reports totals error:', error)
    return res.status(500).json({ error: 'Falha ao calcular totais' })
  }
})

router.get('/mensal', requireAuth, async (req, res) => {
  try {
    const { periodo = '6meses' } = queryWithPeriodo.parse(req.query)
    const range = getPeriodRange(periodo)
  const { baseCurrency, rateMap } = await buildCurrencyContext(prisma, req.user.id, req.query.base)

    const [transactions, accounts, previousTransactions] = await Promise.all([
      loadTransactions(req.user.id, range),
  prisma.account.findMany({ where: { userId: req.user.id }, select: { initialBalance: true } }),
      prisma.transaction.findMany({
        where: {
          account: { userId: req.user.id },
          status: 'confirmado',
          data: { lt: range.start },
        },
        select: { valor: true, tipo: true },
      }),
    ])

    const buckets = buildMonthBuckets(range.end, range.months)
    const bucketsMap = new Map(buckets.map((bucket) => [bucket.key, bucket]))

    transactions.forEach((tx) => {
      const date = tx.data
      const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}`
      const bucket = bucketsMap.get(key)
      if (!bucket) return
      // hotfix: tratar todas as quantias na moeda base
      const valor = convertAmount(tx.valor, baseCurrency, baseCurrency, rateMap)
      if (tx.tipo === 'receita') bucket.receitas += valor
      else bucket.despesas += valor
    })

    const receitasVsDespesas = buckets.map((bucket) => ({
      mes: bucket.mes,
      ano: bucket.ano,
      receitas: round2(bucket.receitas),
      despesas: round2(bucket.despesas),
    }))

    const saldoInicial = accounts.reduce((acc, account) => acc + Number(account.initialBalance ?? 0), 0)
    const saldoAnterior = previousTransactions.reduce((acc, tx) => {
      const valor = convertAmount(tx.valor, baseCurrency, baseCurrency, rateMap)
      return tx.tipo === 'receita' ? acc + valor : acc - valor
    }, saldoInicial)

    let acumulado = round2(saldoAnterior)
    const evolucaoSaldo = receitasVsDespesas.map((bucket) => {
      acumulado = round2(acumulado + bucket.receitas - bucket.despesas)
      return { mes: bucket.mes, ano: bucket.ano, saldo: acumulado }
    })

    res.json({
      baseCurrency,
      period: {
        periodo,
        inicio: range.start.toISOString(),
        fim: range.end.toISOString(),
      },
      receitasVsDespesas,
      evolucaoSaldo,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: 'Parâmetros inválidos', issues: error.flatten() })
    }
    console.error('Reports monthly error:', error)
    return res.status(500).json({ error: 'Falha ao calcular séries mensais' })
  }
})

router.get('/categorias', requireAuth, async (req, res) => {
  try {
    const { periodo = '6meses' } = queryWithPeriodo.parse(req.query)
    const range = getPeriodRange(periodo)
  const { baseCurrency, rateMap } = await buildCurrencyContext(prisma, req.user.id, req.query.base)
    const transactions = await loadTransactions(req.user.id, range, { includeCategory: true })

    const despesas = transactions.filter((tx) => tx.tipo === 'despesa')
    const totalDespesas = despesas.reduce((acc, tx) => acc + convertAmount(tx.valor, baseCurrency, baseCurrency, rateMap), 0)

    const categoryMap = new Map()
    despesas.forEach((tx) => {
      const key = tx.categoryId ?? tx.categoria ?? 'Outros'
      const entry = categoryMap.get(key) ?? {
        name: tx.category?.name ?? tx.categoria ?? 'Outros',
        color: tx.category?.color ?? null,
        value: 0,
      }
  entry.value += convertAmount(tx.valor, baseCurrency, baseCurrency, rateMap)
      if (!entry.color && tx.category?.color) entry.color = tx.category.color
      categoryMap.set(key, entry)
    })

    const categorias = Array.from(categoryMap.values())
      .sort((a, b) => b.value - a.value)
      .map((entry, index) => ({
        name: entry.name,
        value: round2(entry.value),
        percentage: totalDespesas ? round1((entry.value / totalDespesas) * 100) : 0,
        color: entry.color || colorPalette[index % colorPalette.length],
      }))

    res.json({
      baseCurrency,
      period: {
        periodo,
        inicio: range.start.toISOString(),
        fim: range.end.toISOString(),
      },
      totalDespesas: round2(totalDespesas),
      categorias,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: 'Parâmetros inválidos', issues: error.flatten() })
    }
    console.error('Reports category error:', error)
    return res.status(500).json({ error: 'Falha ao calcular categorias' })
  }
})

export default router
