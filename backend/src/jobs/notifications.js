import prisma from '../lib/prisma.js'
import { sendMail } from '../lib/mailer.js'

function startOfToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

async function createNotify(userId, type, title, body, severity = 'info') {
  const today = startOfToday()
  const exists = await prisma.notification.findFirst({
    where: {
      userId,
      type,
      title,
      createdAt: { gte: today },
    },
  })

  if (exists) return exists

  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message: body,
      severity,
    },
  })
}

export async function generateNotifications() {
  const users = await prisma.user.findMany({ select: { id: true, email: true } })

  for (const user of users) {
    const pref = await prisma.notificationPref.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        budgetThreshold: Number(process.env.NOTIFY_BUDGET_THRESHOLD || 0.8),
        debtDaysBefore: Number(process.env.NOTIFY_DEBT_DAYS || 3),
      },
    })

    const today = new Date()
    const month = today.getMonth()
    const year = today.getFullYear()
    const monthStart = new Date(year, month, 1, 0, 0, 0, 0)
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999)

    const budgets = await prisma.budget.findMany({
      where: { userId: user.id },
      include: { category: { select: { id: true, name: true } } },
    })

    if (budgets.length) {
      const spentByCategoryId = await prisma.transaction.groupBy({
        by: ['categoryId'],
        where: {
          account: { userId: user.id },
          status: 'confirmado',
          tipo: 'despesa',
          data: { gte: monthStart, lte: monthEnd },
        },
        _sum: { valor: true },
      })

      const spentByCategoryName = await prisma.transaction.groupBy({
        by: ['categoria'],
        where: {
          account: { userId: user.id },
          status: 'confirmado',
          tipo: 'despesa',
          data: { gte: monthStart, lte: monthEnd },
        },
        _sum: { valor: true },
      })

      const mapById = new Map(spentByCategoryId.map((entry) => [entry.categoryId ?? 'null', Number(entry._sum?.valor ?? 0)]))
      const mapByName = new Map(spentByCategoryName.map((entry) => [entry.categoria ?? '', Number(entry._sum?.valor ?? 0)]))
      const threshold = Number(pref.budgetThreshold ?? 0.8)

      for (const budget of budgets) {
        const limit = Number(budget.limitAmount ?? 0)
        if (!limit) continue

        let spent = 0
        if (budget.categoryId != null) {
          spent = mapById.get(budget.categoryId) ?? 0
        } else if (budget.category?.name) {
          spent = mapByName.get(budget.category.name) ?? 0
        }

        const usage = limit > 0 ? spent / limit : 0
        if (usage >= threshold) {
          const percentage = Math.round(usage * 100)
          await createNotify(
            user.id,
            'BUDGET_THRESHOLD',
            `Orçamento de ${budget.name} passou de ${percentage}%`,
            `Você já gastou ${spent.toFixed(2)} de ${limit.toFixed(2)} neste mês para ${budget.name}.`,
            'warning',
          )
        }
      }
    }

    if (Number(pref.debtDaysBefore ?? 0) > 0) {
      const windowStart = startOfToday()
      const windowEnd = new Date(windowStart)
      windowEnd.setDate(windowEnd.getDate() + Number(pref.debtDaysBefore))

      const debts = await prisma.debt.findMany({
        where: {
          userId: user.id,
          status: 'active',
          OR: [
            { dueDate: { gte: windowStart, lte: windowEnd } },
            { dueDate: { lt: windowStart } },
          ],
        },
      })

      for (const debt of debts) {
        const dueDate = debt.dueDate ? debt.dueDate.toISOString().slice(0, 10) : 'sem data definida'
        await createNotify(
          user.id,
          'DEBT_DUE',
          `Dívida "${debt.title}" vence em breve`,
          `Vencimento: ${dueDate}. Valor: ${Number(debt.principal).toFixed(2)}.`,
          'warning',
        )
      }
    }

    const goals = await prisma.goal.findMany({ where: { userId: user.id } })
    for (const goal of goals) {
      const current = Number(goal.currentAmount ?? 0)
      const target = Number(goal.targetAmount ?? 0)
      if (target > 0 && current >= target) {
        await createNotify(
          user.id,
          'GOAL_REACHED',
          `Meta "${goal.title}" atingida!`,
          `Você alcançou o objetivo de ${target.toFixed(2)}. Parabéns!`,
          'success',
        )
      }
    }

    const todayNotifications = await prisma.notification.findMany({
      where: { userId: user.id, createdAt: { gte: startOfToday() } },
      orderBy: { createdAt: 'desc' },
    })

    if ((pref.emailEnabled ?? true) && todayNotifications.length && user.email) {
      const html = `<p>Você tem ${todayNotifications.length} notificação(ões) no MoneyMap.</p><ul>${todayNotifications
        .map((n) => `<li><strong>${n.title}</strong> — ${n.message}</li>`)
        .join('')}</ul>`
      try {
        await sendMail(user.email, 'Resumo diário MoneyMap', html)
      } catch (error) {
        console.error('[notifications] falha ao enviar e-mail', user.email, error)
      }
    }
  }
}
