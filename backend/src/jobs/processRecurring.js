import prisma from '../lib/prisma.js'

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date, amount) {
  const result = new Date(date)
  result.setDate(result.getDate() + amount)
  return result
}

function addMonths(date, amount) {
  const result = new Date(date)
  const day = result.getDate()
  result.setDate(1)
  result.setMonth(result.getMonth() + amount)
  const monthLength = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate()
  result.setDate(Math.min(day, monthLength))
  return result
}

function alignToDayOfMonth(date, day) {
  if (day == null) return date
  const result = new Date(date)
  const monthLength = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate()
  result.setDate(Math.min(day, monthLength))
  return result
}

function alignToDayOfWeek(date, weekday) {
  if (weekday == null) return date
  const result = new Date(date)
  const current = result.getDay()
  const diff = (weekday + 7 - current) % 7
  result.setDate(result.getDate() + (diff === 0 ? 7 : diff))
  return result
}

export async function processRecurringRules() {
  const now = new Date()

  const rules = await prisma.recurringRule.findMany({
    where: { active: true, nextRunAt: { lte: now } },
  })

  for (const rule of rules) {
    const runDate = startOfDay(rule.nextRunAt)

    const already = await prisma.recurringExecution.findUnique({
      where: { ruleId_runDate: { ruleId: rule.id, runDate } },
    })
    if (already) continue

    let createdTxId = null
    let executionCreated = false

    try {
      const account = await prisma.account.findFirst({
        where: { id: rule.accountId, userId: rule.userId, archivedAt: null },
      })

      if (!account) {
        await prisma.recurringExecution.create({ data: { ruleId: rule.id, runDate } })
        executionCreated = true
      } else {
        const transaction = await prisma.transaction.create({
          data: {
            accountId: rule.accountId,
            descricao: 'Transação recorrente',
            categoria: rule.categoria,
            valor: rule.valor,
            tipo: rule.tipo,
            status: 'pendente',
            data: runDate,
            observacao: 'Gerado automaticamente',
          },
        })
        createdTxId = transaction.id
        await prisma.recurringExecution.create({ data: { ruleId: rule.id, runDate, createdTx: createdTxId } })
        executionCreated = true
      }
    } catch (error) {
      console.error('[recurring] erro ao processar regra', rule.id, error)
      if (!executionCreated) {
        await prisma.recurringExecution.create({ data: { ruleId: rule.id, runDate } }).catch(() => null)
      }
    }

    let next = new Date(rule.nextRunAt)
    if (rule.freq === 'DAILY') {
      next = addDays(next, 1)
    } else if (rule.freq === 'WEEKLY') {
      next = addDays(next, 7)
      next = alignToDayOfWeek(next, rule.dayOfWeek)
    } else if (rule.freq === 'MONTHLY') {
      next = addMonths(next, 1)
      next = alignToDayOfMonth(next, rule.dayOfMonth ?? next.getDate())
    }
    next = startOfDay(next)

    await prisma.recurringRule.update({
      where: { id: rule.id },
      data: { nextRunAt: next },
    })
  }
}
