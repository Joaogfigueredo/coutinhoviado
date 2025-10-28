// backend/src/index.js
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import fs from 'fs'
import path from 'path'
import cron from 'node-cron'

// Carregar OpenAPI JSON de forma compatível com múltiplas versões do Node
let openapiDocument = {}
try {
  const swaggerPath = path.join(process.cwd(), 'backend', 'swagger', 'openapi.json')
  if (fs.existsSync(swaggerPath)) {
    openapiDocument = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'))
  }
} catch (e) {
  console.warn('Could not load OpenAPI document:', e && e.message)
}
// (fs and path already imported above)
import { fileURLToPath } from 'url'
import morgan from 'morgan'
import prisma from './lib/prisma.js'

import authRouter from './routes/auth.js'
import accountsRouter from './routes/accounts.js'
import transactionsRouter from './routes/transactions.js'
import recurringTransactionsRouter from './routes/recurring-transactions.js'
import categoriesRouter from './routes/categories.js'
import goalsRouter from './routes/goals.js'
import budgetsRouter from './routes/budgets.js'
import debtsRouter from './routes/debts.js'
import reportsRouter from './routes/reports.js'
import dashboardRouter from './routes/dashboard.js'
import notificationsRouter from './routes/notifications.js'
import recurringRouter from './routes/recurring.js'
import settingsRouter from './routes/settings.js'
import educationRouter from './routes/education.js'
import currencyRouter from './routes/currency.js'
import investmentRouter from './routes/investment.js'
import { processRecurringRules } from './jobs/processRecurring.js'
import { generateNotifications } from './jobs/notifications.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

const parseOrigins = (value) => {
  if (!value) return []
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

const allowedOrigins = parseOrigins(process.env.CORS_ORIGINS)

const corsOptions = allowedOrigins.length
  ? {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true)
        }
        console.warn(`CORS bloqueado para origem: ${origin}`)
        return callback(new Error('Not allowed by CORS'))
      },
      credentials: true,
    }
  : undefined

app.use(cors(corsOptions))
app.use(express.json())

// ===== LOGS NO TERMINAL =====

// Linha de acesso (método, url, status, tempo)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

// Logar também o corpo (request/response) — habilitado por padrão
const LOG_BODY = (process.env.LOG_BODY ?? 'true') !== 'false'
app.use((req, res, next) => {
  const started = process.hrtime.bigint()
  const originalJson = res.json.bind(res)

  res.json = (payload) => {
    const elapsed = Number(process.hrtime.bigint() - started) / 1e6
    const safe = (o) => {
      try { return JSON.stringify(o).slice(0, 800) } catch { return String(o) }
    }

    console.log(`↪ ${req.method} ${req.originalUrl} → ${res.statusCode} (${elapsed.toFixed(1)}ms)`)
    if (LOG_BODY) {
      if (req.body && Object.keys(req.body).length) {
        console.log('   req.body:', safe(req.body))
      }
      console.log('   res.body:', safe(payload))
    }

    return originalJson(payload)
  }

  next()
})

// ===== ARQUIVOS ESTÁTICOS /public (sem index em "/") =====
app.use('/public', express.static(path.join(__dirname, '..', 'public'), { index: false }))

// ===== HEALTHCHECK =====
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ ok: true, db: 'up', time: new Date().toISOString() })
  } catch (e) {
    console.error('healthcheck error:', e)
    res.status(500).json({ ok: false, error: 'db down' })
  }
})

// ===== DOCS RÁPIDOS =====
app.get('/docs', (req, res) => {
  res.json({
    health: '/health',
    auth: {
      register: { method: 'POST', path: '/auth/register' },
      login: { method: 'POST', path: '/auth/login' },
      changePassword: { method: 'POST', path: '/auth/change-password' },
    },
    accounts: {
      list: { method: 'GET', path: '/accounts' },
      create: { method: 'POST', path: '/accounts' },
      update: { method: 'PUT', path: '/accounts/:id' },
      remove: { method: 'DELETE', path: '/accounts/:id' },
      migrateTransactions: { method: 'POST', path: '/transacoes/migrate' },
    },
    transacoes: {
      list: { method: 'GET', path: '/transacoes' },
      create: { method: 'POST', path: '/transacoes' },
      update: { method: 'PUT', path: '/transacoes/:id' },
      remove: { method: 'DELETE', path: '/transacoes/:id' },
      migrate: { method: 'POST', path: '/transacoes/migrate' },
      transfer: { method: 'POST', path: '/transacoes/transfer' },
      recurring: {
        list: { method: 'GET', path: '/transacoes/recorrentes' },
        create: { method: 'POST', path: '/transacoes/recorrentes' },
        update: { method: 'PUT', path: '/transacoes/recorrentes/:id' },
        remove: { method: 'DELETE', path: '/transacoes/recorrentes/:id' },
        run: { method: 'POST', path: '/transacoes/recorrentes/:id/executar' },
        process: { method: 'POST', path: '/transacoes/recorrentes/processar' },
      },
    },
    categories: {
      list: { method: 'GET', path: '/categories' },
      create: { method: 'POST', path: '/categories' },
      update: { method: 'PUT', path: '/categories/:id' },
      remove: { method: 'DELETE', path: '/categories/:id' },
    },
    metas: {
      list: { method: 'GET', path: '/metas' },
      create: { method: 'POST', path: '/metas' },
      update: { method: 'PUT', path: '/metas/:id' },
      remove: { method: 'DELETE', path: '/metas/:id' },
    },
    budgets: {
      list: { method: 'GET', path: '/budgets' },
      create: { method: 'POST', path: '/budgets' },
      update: { method: 'PUT', path: '/budgets/:id' },
      remove: { method: 'DELETE', path: '/budgets/:id' },
    },
    debts: {
      list: { method: 'GET', path: '/debts' },
      create: { method: 'POST', path: '/debts' },
      update: { method: 'PUT', path: '/debts/:id' },
      remove: { method: 'DELETE', path: '/debts/:id' },
    },
    notifications: {
      list: { method: 'GET', path: '/notifications' },
      create: { method: 'POST', path: '/notifications' },
      markAllRead: { method: 'POST', path: '/notifications/mark-all-read' },
      markRead: { method: 'POST', path: '/notifications/:id/read' },
      markUnread: { method: 'POST', path: '/notifications/:id/unread' },
      remove: { method: 'DELETE', path: '/notifications/:id' },
      prefs: { method: 'GET', path: '/notifications/prefs' },
      updatePrefs: { method: 'PUT', path: '/notifications/prefs' },
      runNow: { method: 'POST', path: '/notifications/run-now' },
    },
    reports: {
      totals: { method: 'GET', path: '/relatorios/totais' },
      monthly: { method: 'GET', path: '/relatorios/mensal' },
      categories: { method: 'GET', path: '/relatorios/categorias' },
    },
    dashboard: {
      overview: { method: 'GET', path: '/dashboard' },
    },
    recurring: {
      list: { method: 'GET', path: '/recurring' },
      create: { method: 'POST', path: '/recurring' },
      update: { method: 'PUT', path: '/recurring/:id' },
      process: { method: 'POST', path: '/recurring/process-now' },
    },
    settings: {
      get: { method: 'GET', path: '/settings' },
      update: { method: 'PUT', path: '/settings' },
    },
    education: {
      progressList: { method: 'GET', path: '/education/progress' },
      progressSave: { method: 'POST', path: '/education/progress' },
    },
    currency: {
      listRates: { method: 'GET', path: '/currency/rates' },
      upsertRate: { method: 'PUT', path: '/currency/rates' },
    },
    investment: {
      getProfile: { method: 'GET', path: '/investment/profile' },
      saveProfile: { method: 'POST', path: '/investment/profile' },
      guides: { method: 'GET', path: '/investment/guides' },
    },
  })
})

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(openapiDocument))

// ===== ROTAS =====
app.use('/auth', authRouter)
app.use('/accounts', accountsRouter)
app.use('/transacoes/recorrentes', recurringTransactionsRouter)
app.use('/transacoes', transactionsRouter)
app.use('/categories', categoriesRouter)
app.use('/metas', goalsRouter)
app.use('/budgets', budgetsRouter)
app.use('/debts', debtsRouter)
app.use('/relatorios', reportsRouter)
app.use('/dashboard', dashboardRouter)
app.use('/notifications', notificationsRouter)
app.use('/recurring', recurringRouter)
app.use('/settings', settingsRouter)
app.use('/education', educationRouter)
app.use('/currency', currencyRouter)
app.use('/investment', investmentRouter)

// ===== CRON JOBS =====
cron.schedule('10 2 * * *', async () => {
  try {
    await processRecurringRules()
    console.info('[cron] recurring ok')
  } catch (error) {
    console.error('[cron] recurring error:', error?.message || error)
  }
})

cron.schedule('30 7 * * *', async () => {
  try {
    await generateNotifications()
    console.info('[cron] notifications ok')
  } catch (error) {
    console.error('[cron] notifications error:', error?.message || error)
  }
})

// ===== SERVE SPA (produção) ou REDIRECIONA PARA O VITE (dev) =====
const STATIC_DIR = process.env.STATIC_DIR
if (STATIC_DIR && fs.existsSync(STATIC_DIR) && fs.existsSync(path.join(STATIC_DIR, 'index.html'))) {
  console.log('[server] Serving SPA from', STATIC_DIR)
  app.use(express.static(STATIC_DIR))
  const apiPrefixes = ['/auth', '/health', '/docs', '/public']
  app.get('*', (req, res, next) => {
    if (apiPrefixes.some((p) => req.path.startsWith(p))) return next()
    res.sendFile(path.join(STATIC_DIR, 'index.html'))
  })
} else {
  app.get('/', (req, res) => {
    const url = process.env.FRONTEND_URL || 'http://localhost:5173'
    res.redirect(url)
  })
}

// ===== HANDLER GLOBAL DE ERROS =====
/* eslint-disable no-unused-vars */
app.use((err, req, res, next) => {
  console.error('💥 Unhandled error:', err)
  if (res.headersSent) return next(err)
  res.status(500).json({ error: 'Erro interno' })
})
/* eslint-enable no-unused-vars */

// ===== START =====
// Para desenvolvimento local
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log(`[auth] listening on http://localhost:${PORT}`)
  })
}

// Exportar para Vercel serverless
export default app
