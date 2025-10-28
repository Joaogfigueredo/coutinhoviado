import crypto from 'crypto'
import { Router } from 'express'
import multer from 'multer'
import { parse } from 'csv-parse/sync'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import prisma from '../lib/prisma.js'

const router = Router()

function txHash ({ userId, accountId, data, valor, descricao }) {
  const date = new Date(data)
  if (Number.isNaN(date.getTime())) return null
  const base = `${userId}|${accountId}|${date.toISOString().slice(0, 10)}|${Number(valor).toFixed(2)}|${(descricao || '').trim().toLowerCase()}`
  return crypto.createHash('sha256').update(base).digest('hex')
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
})

const MAX_IMPORT_ROWS = 1000
const MAX_IMPORT_ERRORS = 50
const MAX_IMPORT_WARNINGS = 50

const RECEITA_KEYWORDS = ['receita', 'entrada', 'income', 'credit', 'crédito', 'credito', 'deposito', 'depósito', 'deposit', 'inflow']
const DESPESA_KEYWORDS = ['despesa', 'saida', 'saída', 'expense', 'debito', 'débito', 'debit', 'outflow', 'pagamento', 'compra', 'purchase', 'saque', 'retirada']

const normalizeKey = (value) => {
  if (value === undefined || value === null) return ''
  return value
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '')
}

const normalizeSimpleKey = (value) => normalizeKey(value)

const normalizeRow = (row) => {
  const result = {}
  Object.entries(row ?? {}).forEach(([key, rawValue]) => {
    const normalizedKey = normalizeKey(key)
    if (!normalizedKey) return
    if (typeof rawValue === 'string') {
      result[normalizedKey] = rawValue.trim()
    } else {
      result[normalizedKey] = rawValue
    }
  })
  return result
}

const parseAmount = (value) => {
  if (value === null || value === undefined) return Number.NaN
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : Number.NaN
  }

  let text = value.toString().trim()
  if (!text) return Number.NaN

  text = text.replace(/\u00a0/g, '')
  text = text.replace(/R\$/gi, '')
  text = text.replace(/[^0-9,\.\-()]/g, '')

  if (!text) return Number.NaN

  if (text.startsWith('(') && text.endsWith(')')) {
    text = `-${text.slice(1, -1)}`
  }

  const hasComma = text.includes(',')
  const hasDot = text.includes('.')
  if (hasComma && hasDot) {
    if (text.lastIndexOf(',') > text.lastIndexOf('.')) {
      text = text.replace(/\./g, '').replace(',', '.')
    } else {
      text = text.replace(/,/g, '')
    }
  } else if (hasComma) {
    text = text.replace(',', '.')
  }

  const parsed = Number(text)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

const pad2 = (value) => value.toString().padStart(2, '0')

const parseDateString = (value) => {
  if (value === undefined || value === null) return null
  let text = value.toString().trim()
  if (!text) return null

  text = text.replace(/\./g, '-')

  let match = text.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/)
  if (match) {
    const [, yearRaw, monthRaw, dayRaw] = match
    const year = Number(yearRaw)
    const month = Number(monthRaw)
    const day = Number(dayRaw)
    if (year >= 1900 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year.toString().padStart(4, '0')}-${pad2(month)}-${pad2(day)}`
    }
  }

  match = text.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/)
  if (match) {
    const [, dayRaw, monthRaw, yearRaw] = match
    const year = Number(yearRaw)
    const month = Number(monthRaw)
    const day = Number(dayRaw)
    if (year >= 1900 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year.toString().padStart(4, '0')}-${pad2(month)}-${pad2(day)}`
    }
  }

  if (/^\d{8}$/.test(text)) {
    const year = Number(text.slice(0, 4))
    const month = Number(text.slice(4, 6))
    const day = Number(text.slice(6, 8))
    if (year >= 1900 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year.toString().padStart(4, '0')}-${pad2(month)}-${pad2(day)}`
    }
  }

  const parsed = new Date(text)
  if (Number.isNaN(parsed.getTime())) return null
  const year = parsed.getUTCFullYear()
  const month = parsed.getUTCMonth() + 1
  const day = parsed.getUTCDate()
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null
  return `${year.toString().padStart(4, '0')}-${pad2(month)}-${pad2(day)}`
}

const inferTipo = (rawTipo, valor, defaultTipo) => {
  const texto = rawTipo ? rawTipo.toString().trim().toLowerCase() : ''
  if (texto) {
    if (RECEITA_KEYWORDS.some((keyword) => texto.includes(keyword))) return 'receita'
    if (DESPESA_KEYWORDS.some((keyword) => texto.includes(keyword))) return 'despesa'
  }

  if (Number.isFinite(valor) && valor !== 0) {
    return valor < 0 ? 'despesa' : 'receita'
  }

  if (defaultTipo === 'receita' || defaultTipo === 'despesa') return defaultTipo
  return null
}

const detectDelimiter = (content) => {
  const lines = content.split(/\r?\n/)
  const header = lines.find((line) => line.trim().length > 0) ?? ''
  if (!header) return ','
  if (header.includes('\t') && header.split('\t').length > 1) return '\t'
  const semicolonSplit = header.split(';').length
  const commaSplit = header.split(',').length
  if (semicolonSplit > 1 && commaSplit <= 1) return ';'
  return ','
}

const TIPO_VALUES = ['receita', 'despesa']
const STATUS_VALUES = ['confirmado', 'pendente']

const valorSchema = z
  .union([z.string(), z.number()])
  .transform((valor) => {
    if (typeof valor === 'string') {
      const normalized = valor.replace(',', '.').trim()
      if (!normalized) throw new Error('Valor inválido')
      return Number(normalized)
    }
    return valor
  })
  .pipe(z.number().finite())
  .refine((valor) => valor >= 0, 'Valor deve ser positivo')

const dateSchema = z
  .union([z.string(), z.date()])
  .transform((input) => {
    const date = typeof input === 'string' ? new Date(input) : input
    if (Number.isNaN(date.getTime())) throw new Error('Data inválida')
    return date
  })
  .transform((date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())))

const tipoSchema = z.enum([TIPO_VALUES[0], TIPO_VALUES[1]])
const statusSchema = z.enum([STATUS_VALUES[0], STATUS_VALUES[1]])

const optionalCategoryId = z
  .preprocess((value) => (value === undefined || value === '' ? undefined : value), z.coerce.number().int().positive().optional())

const CreateTransactionSchema = z.object({
  accountId: z.coerce.number().int().positive().optional(),
  descricao: z.string().trim().min(2).max(180),
  categoria: z.string().trim().min(1).max(80).optional(),
  categoryId: optionalCategoryId,
  valor: valorSchema,
  tipo: tipoSchema,
  status: statusSchema.default('confirmado'),
  data: dateSchema,
  observacao: z.string().trim().max(500).optional(),
})

const UpdateTransactionSchema = z.object({
  descricao: z.string().trim().min(2).max(180).optional(),
  categoria: z.string().trim().min(1).max(80).optional(),
  categoryId: optionalCategoryId,
  valor: valorSchema.optional(),
  tipo: tipoSchema.optional(),
  status: statusSchema.optional(),
  data: dateSchema.optional(),
  observacao: z.string().trim().max(500).optional(),
})

const optionalQueryNumber = z.preprocess(
  (value) => (value === undefined || value === '' ? undefined : value),
  z.coerce.number().int().positive().optional()
)

const optionalQueryEnum = (schema) =>
  z.preprocess((value) => (value === undefined || value === '' ? undefined : value), schema.optional())

const optionalQueryDate = z.preprocess(
  (value) => (value === undefined || value === '' ? undefined : value),
  dateSchema.optional()
)

const optionalPositiveInt = z.preprocess(
  (value) => (value === undefined || value === '' ? undefined : value),
  z.coerce.number().int().min(1).optional()
)

const sortFieldSchema = z.enum(['data', 'valor', 'createdAt'])
const sortOrderSchema = z.enum(['asc', 'desc'])

const ListQuerySchema = z.object({
  accountId: optionalQueryNumber,
  tipo: optionalQueryEnum(tipoSchema),
  status: optionalQueryEnum(statusSchema),
  from: optionalQueryDate,
  to: optionalQueryDate,
  page: optionalPositiveInt,
  perPage: optionalPositiveInt,
  sortBy: optionalQueryEnum(sortFieldSchema),
  sortOrder: optionalQueryEnum(sortOrderSchema),
})

const serializeTransaction = (transaction) => ({
  id: transaction.id,
  accountId: transaction.accountId,
  descricao: transaction.descricao,
  categoria: transaction.categoria,
  categoryId: transaction.categoryId ?? null,
  valor: transaction.valor.toNumber(),
  tipo: transaction.tipo,
  status: transaction.status,
  data: transaction.data.toISOString().slice(0, 10),
  observacao: transaction.observacao ?? null,
  createdAt: transaction.createdAt.toISOString(),
  updatedAt: transaction.updatedAt.toISOString(),
  account: transaction.account
    ? {
        id: transaction.account.id,
        name: transaction.account.name,
        color: transaction.account.color,
        isDefault: transaction.account.isDefault,
        archivedAt: transaction.account.archivedAt ? transaction.account.archivedAt.toISOString() : null,
      }
    : undefined,
  category: transaction.category
    ? {
        id: transaction.category.id,
        name: transaction.category.name,
        color: transaction.category.color,
      }
    : undefined,
})

router.get('/', requireAuth, async (req, res) => {
  try {
    const { accountId, tipo, status, from, to, page, perPage, sortBy, sortOrder } = ListQuerySchema.parse(req.query)

    const where = {
      account: { userId: req.user.id },
    }

    if (accountId !== undefined) where.accountId = accountId
    if (tipo) where.tipo = tipo
    if (status) where.status = status

    if (from || to) {
      where.data = {
        ...(from ? { gte: from } : {}),
        ...(to ? { lte: to } : {}),
      }
    }

    const orderConfig = (() => {
      if (!sortBy) {
        return [{ data: 'desc' }, { id: 'desc' }]
      }

      const direction = sortOrder ?? 'desc'
      if (sortBy === 'valor') {
        return [{ valor: direction }, { id: 'desc' }]
      }
      return [{ [sortBy]: direction }, { id: 'desc' }]
    })()

    const total = await prisma.transaction.count({ where })

    const shouldPaginate = page !== undefined || perPage !== undefined
    const currentPage = shouldPaginate ? (page ?? 1) : 1
    const size = shouldPaginate ? Math.min(perPage ?? 50, 100) : total || 0
    const skip = shouldPaginate ? (currentPage - 1) * size : undefined
    const take = shouldPaginate ? size : undefined

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: orderConfig,
      include: {
        account: { select: { id: true, name: true, color: true, isDefault: true, archivedAt: true } },
        category: { select: { id: true, name: true, color: true } },
      },
      skip,
      take,
    })

    const payload = {
      transactions: transactions.map(serializeTransaction),
      meta: {
        total,
        page: currentPage,
        perPage: shouldPaginate ? size : total || transactions.length,
        totalPages: shouldPaginate ? Math.max(Math.ceil(total / (size || 1)), 1) : 1,
        sortBy: sortBy ?? 'data',
        sortOrder: sortOrder ?? 'desc',
      },
    }

    res.json(payload)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: 'Filtros inválidos', issues: error.flatten() })
    }
    console.error('List transactions error:', error)
    return res.status(500).json({ error: 'Falha ao listar transações' })
  }
})

router.post('/', requireAuth, async (req, res) => {
  try {
    const payload = CreateTransactionSchema.parse(req.body)
    let account = null

    if (payload.accountId) {
      account = await prisma.account.findFirst({ where: { id: payload.accountId, userId: req.user.id } })
      if (!account) {
        return res.status(404).json({ error: 'Conta não encontrada' })
      }
    } else {
      account = await prisma.account.findFirst({ where: { userId: req.user.id, isDefault: true, archivedAt: null } })
      if (!account) {
        return res.status(422).json({ error: 'Nenhuma conta disponível para registrar a transação' })
      }
    }

    if (account.archivedAt) {
      return res.status(409).json({ error: 'Conta arquivada não aceita novas transações' })
    }

    let categoriaNome = payload.categoria?.trim()
    let categoriaId = payload.categoryId ?? null
    if (categoriaId) {
      const category = await prisma.category.findFirst({ where: { id: categoriaId, userId: req.user.id } })
      if (!category) {
        return res.status(404).json({ error: 'Categoria não encontrada' })
      }
      categoriaNome = category.name
    }

    if (!categoriaNome) {
      categoriaNome = 'Outros'
    }

    const transaction = await prisma.transaction.create({
      data: {
        accountId: account.id,
        descricao: payload.descricao,
        categoria: categoriaNome,
        categoryId: categoriaId,
        valor: payload.valor,
        tipo: payload.tipo,
        status: payload.status,
        data: payload.data,
        observacao: payload.observacao,
      },
      include: {
        account: { select: { id: true, name: true, color: true, isDefault: true, archivedAt: true } },
        category: { select: { id: true, name: true, color: true } },
      },
    })

    res.status(201).json({ transaction: serializeTransaction(transaction) })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: 'Dados inválidos', issues: error.flatten() })
    }
    console.error('Create transaction error:', error)
    return res.status(500).json({ error: 'Falha ao registrar transação' })
  }
})

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const transactionId = Number(req.params.id)
    if (!Number.isInteger(transactionId)) {
      return res.status(400).json({ error: 'ID inválido' })
    }

    const parsed = UpdateTransactionSchema.parse(req.body)
    if (!Object.keys(parsed).length) {
      return res.status(422).json({ error: 'Nenhum dado informado' })
    }

    const existing = await prisma.transaction.findFirst({
      where: { id: transactionId, account: { userId: req.user.id } },
      include: { account: true },
    })

    if (!existing) {
      return res.status(404).json({ error: 'Transação não encontrada' })
    }

    if (existing.account.archivedAt) {
      return res.status(409).json({ error: 'Transações em conta arquivada não podem ser editadas' })
    }

    let categoriaNome = parsed.categoria
    let categoriaId = parsed.categoryId ?? undefined

    if (categoriaId !== undefined) {
      if (categoriaId === null) {
        categoriaId = undefined
        categoriaNome = categoriaNome ?? existing.categoria
      } else {
        const category = await prisma.category.findFirst({ where: { id: categoriaId, userId: req.user.id } })
        if (!category) {
          return res.status(404).json({ error: 'Categoria não encontrada' })
        }
        categoriaNome = category.name
      }
    }

    if (categoriaNome !== undefined && !categoriaNome.trim()) {
      return res.status(422).json({ error: 'Categoria inválida' })
    }

    const updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        descricao: parsed.descricao ?? undefined,
        categoria: categoriaNome ?? undefined,
        categoryId: categoriaId ?? undefined,
        valor: parsed.valor ?? undefined,
        tipo: parsed.tipo ?? undefined,
        status: parsed.status ?? undefined,
        data: parsed.data ?? undefined,
        observacao: parsed.observacao ?? undefined,
      },
      include: {
        account: { select: { id: true, name: true, color: true, isDefault: true, archivedAt: true } },
        category: { select: { id: true, name: true, color: true } },
      },
    })

    res.json({ transaction: serializeTransaction(updated) })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: 'Dados inválidos', issues: error.flatten() })
    }
    console.error('Update transaction error:', error)
    return res.status(500).json({ error: 'Falha ao atualizar transação' })
  }
})

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const transactionId = Number(req.params.id)
    if (!Number.isInteger(transactionId)) {
      return res.status(400).json({ error: 'ID inválido' })
    }

    const existing = await prisma.transaction.findFirst({
      where: { id: transactionId, account: { userId: req.user.id } },
      select: { id: true, account: { select: { archivedAt: true } } },
    })

    if (!existing) {
      return res.status(404).json({ error: 'Transação não encontrada' })
    }

    if (existing.account.archivedAt) {
      return res.status(409).json({ error: 'Transações em conta arquivada não podem ser removidas' })
    }

    await prisma.transaction.delete({ where: { id: transactionId } })

    res.status(204).send()
  } catch (error) {
    console.error('Delete transaction error:', error)
    return res.status(500).json({ error: 'Falha ao remover transação' })
  }
})

const MigrateTransactionsSchema = z.object({
  fromAccountId: z.coerce.number().int().positive(),
  toAccountId: z.coerce.number().int().positive(),
  transactionIds: z.array(z.coerce.number().int().positive()).optional(),
})

router.post('/migrate', requireAuth, async (req, res) => {
  try {
    const { fromAccountId, toAccountId, transactionIds } = MigrateTransactionsSchema.parse(req.body)

    if (fromAccountId === toAccountId) {
      return res.status(422).json({ error: 'Contas de origem e destino devem ser diferentes' })
    }

    const [fromAccount, toAccount] = await Promise.all([
      prisma.account.findFirst({ where: { id: fromAccountId, userId: req.user.id } }),
      prisma.account.findFirst({ where: { id: toAccountId, userId: req.user.id } }),
    ])

    if (!fromAccount || !toAccount) {
      return res.status(404).json({ error: 'Conta não encontrada' })
    }

    if (fromAccount.archivedAt) {
      return res.status(409).json({ error: 'Não é possível migrar de uma conta arquivada' })
    }

    if (toAccount.archivedAt) {
      return res.status(409).json({ error: 'Não é possível migrar para uma conta arquivada' })
    }

    const whereClause = {
      accountId: fromAccountId,
      account: { userId: req.user.id },
      ...(transactionIds ? { id: { in: transactionIds } } : {}),
    }

    const result = await prisma.transaction.updateMany({ where: whereClause, data: { accountId: toAccountId } })

    res.json({ migrated: result.count })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: 'Dados inválidos', issues: error.flatten() })
    }
    console.error('Migrate transaction error:', error)
    return res.status(500).json({ error: 'Falha ao migrar transações' })
  }
})

router.post('/import', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Envie um arquivo CSV para importar.' })
    }

    const defaultStatus = req.body.status === 'pendente' ? 'pendente' : 'confirmado'
    const defaultTipoRaw = (req.body.defaultTipo ?? '').toString().trim().toLowerCase()
    const defaultTipo = ['receita', 'despesa'].includes(defaultTipoRaw) ? defaultTipoRaw : 'auto'
    const defaultCategoria = (req.body.defaultCategoria ?? '').toString().trim()
    const requestedAccountId = req.body.accountId ? Number(req.body.accountId) : null

    if (requestedAccountId !== null && !Number.isFinite(requestedAccountId)) {
      return res.status(422).json({ error: 'Conta informada é inválida.' })
    }

    const accounts = await prisma.account.findMany({
      where: { userId: req.user.id, archivedAt: null },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    })

    if (!accounts.length) {
      return res.status(422).json({ error: 'Nenhuma conta ativa disponível para importação.' })
    }

    const accountById = new Map(accounts.map((account) => [account.id, account]))
    const accountByName = new Map(accounts.map((account) => [normalizeSimpleKey(account.name), account]))

    let defaultAccount = null
    if (requestedAccountId) {
      defaultAccount = accountById.get(requestedAccountId)
      if (!defaultAccount) {
        return res.status(404).json({ error: 'Conta informada não foi encontrada.' })
      }
    } else {
      defaultAccount = accounts.find((account) => account.isDefault) ?? accounts[0]
    }

    const categories = await prisma.category.findMany({
      where: { userId: req.user.id },
      orderBy: { name: 'asc' },
    })

    const categoryByName = new Map(categories.map((category) => [normalizeSimpleKey(category.name), category]))

    const csvContent = req.file.buffer.toString('utf8')
    const delimiter = detectDelimiter(csvContent)

    let records = []
    try {
      records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
        delimiter,
      })
    } catch (error) {
      console.error('CSV parse error:', error)
      return res.status(400).json({ error: 'Não foi possível ler o CSV enviado.' })
    }

    if (!records.length) {
      return res.status(422).json({ error: 'Arquivo sem linhas válidas para importação.' })
    }

    if (records.length > MAX_IMPORT_ROWS) {
      return res.status(413).json({ error: `Limite máximo de ${MAX_IMPORT_ROWS} linhas excedido.` })
    }

    const errors = []
    const warnings = []
    let skippedRows = 0
    let adjustedSigns = 0
    const validRows = []

    const pushError = (row, message) => {
      skippedRows += 1
      if (errors.length < MAX_IMPORT_ERRORS) {
        errors.push({ row, message })
      }
    }

    const pushWarning = (row, message) => {
      if (warnings.length < MAX_IMPORT_WARNINGS) {
        warnings.push({ row, message })
      }
    }

    records.forEach((rawRow, index) => {
      if (errors.length >= MAX_IMPORT_ERRORS && warnings.length >= MAX_IMPORT_WARNINGS) {
        return
      }

      const lineNumber = index + 2
      const row = normalizeRow(rawRow)

      if (!row || Object.values(row).every((value) => value === '' || value === undefined || value === null)) {
        return
      }

      const descricao = (row.descricao ?? row.description ?? row.historico ?? row.resumo ?? '').toString().trim()
      const rawValor = row.valor ?? row.amount ?? row.valororiginal ?? row.total ?? row.valorbruto
      const rawTipo = row.tipo ?? row.type ?? row.movimento ?? row.operacao
      const rawData = row.data ?? row.date ?? row.lancamento ?? row.competencia
      const rawCategoria = row.categoria ?? row.category ?? row.classificacao ?? row.tag ?? defaultCategoria
      const rawStatus = row.status ?? row.situacao ?? defaultStatus
      const rawConta = row.conta ?? row.account ?? row.carteira ?? row.banco ?? null
      const rawObservacao = row.observacao ?? row.memo ?? row.nota ?? row.comentario ?? null

      if (!descricao) {
        pushError(lineNumber, 'Descrição obrigatória ou não encontrada.')
        return
      }

      const valorNumber = parseAmount(rawValor)
      if (!Number.isFinite(valorNumber) || valorNumber === 0) {
        pushError(lineNumber, 'Valor inválido ou ausente.')
        return
      }

      const dataISO = parseDateString(rawData)
      if (!dataISO) {
        pushError(lineNumber, 'Data inválida ou não reconhecida.')
        return
      }

      const tipo = inferTipo(rawTipo, valorNumber, defaultTipo)
      if (!tipo) {
        pushError(lineNumber, 'Não foi possível determinar se a linha é receita ou despesa.')
        return
      }

      let account = defaultAccount
      if (rawConta) {
        const normalizedAccountName = normalizeSimpleKey(rawConta)
        const accountMatch = accountByName.get(normalizedAccountName)
        if (accountMatch) {
          account = accountMatch
        } else {
          pushWarning(lineNumber, `Conta "${rawConta}" não encontrada. Usando conta padrão ${defaultAccount.name}.`)
        }
      }

      const categoriaEntrada = (rawCategoria ?? '').toString().trim()
      const categoriaKey = normalizeSimpleKey(categoriaEntrada || defaultCategoria || 'Outros')
      const categoriaMatch = categoriaKey ? categoryByName.get(categoriaKey) : null
      const categoriaNome = categoriaMatch ? categoriaMatch.name : categoriaEntrada || defaultCategoria || 'Outros'
      const categoriaId = categoriaMatch ? categoriaMatch.id : undefined

      const status = rawStatus?.toString().trim().toLowerCase() === 'pendente' ? 'pendente' : 'confirmado'
      const observacao = rawObservacao ? rawObservacao.toString().trim().slice(0, 500) : undefined

      if ((valorNumber < 0 && tipo === 'receita') || (valorNumber > 0 && tipo === 'despesa')) {
        adjustedSigns += 1
        pushWarning(lineNumber, 'Sinal do valor ajustado para corresponder ao tipo informado.')
      }

      const payload = {
        accountId: account.id,
        descricao: descricao.slice(0, 180),
        categoria: (categoriaNome || 'Outros').slice(0, 80) || 'Outros',
        categoryId,
        valor: Math.abs(valorNumber),
        tipo,
        status,
        data: dataISO,
        observacao,
      }

      const parsed = CreateTransactionSchema.safeParse(payload)
      if (!parsed.success) {
        pushError(lineNumber, 'Dados inválidos após validação.')
        return
      }

      const dataFinal = parsed.data
      const targetAccountId = dataFinal.accountId ?? account.id
      const hash = txHash({
        userId: req.user.id,
        accountId: targetAccountId,
        data: dataFinal.data,
        valor: dataFinal.valor,
        descricao: dataFinal.descricao,
      })

      validRows.push({
        accountId: targetAccountId,
        descricao: dataFinal.descricao,
        categoria: dataFinal.categoria ?? 'Outros',
        categoryId: dataFinal.categoryId ?? null,
        valor: dataFinal.valor,
        tipo: dataFinal.tipo,
        status: dataFinal.status,
        data: dataFinal.data,
        observacao: dataFinal.observacao ?? null,
        importHash: hash,
      })
    })

    if (!validRows.length) {
      return res.status(422).json({
        error: 'Nenhuma linha válida encontrada no CSV.',
        errors,
      })
    }

    const seenHashes = new Set()
    const uniqueRows = []
    let duplicateInFile = 0
    for (const row of validRows) {
      if (!row.importHash) {
        uniqueRows.push(row)
        continue
      }
      if (seenHashes.has(row.importHash)) {
        duplicateInFile += 1
        continue
      }
      seenHashes.add(row.importHash)
      uniqueRows.push(row)
    }

    if (!uniqueRows.length) {
      return res.json({
        processed: records.length,
        imported: 0,
        ignored: skippedRows + duplicateInFile,
        duplicates: duplicateInFile,
        adjustedSigns,
        warnings,
        errors,
      })
    }

    const insertResult = await prisma.transaction.createMany({
      data: uniqueRows,
      skipDuplicates: true,
    })

    const duplicates = duplicateInFile + Math.max(0, uniqueRows.length - insertResult.count)
    const ignored = skippedRows + duplicates

    res.json({
      processed: records.length,
      imported: insertResult.count,
      ignored,
      duplicates,
      adjustedSigns,
      warnings,
      errors,
    })
  } catch (error) {
    console.error('Import transactions error:', error)
    res.status(500).json({ error: 'Falha ao importar transações.' })
  }
})

const TransferSchema = z.object({
  fromAccountId: z.coerce.number().int().positive(),
  toAccountId: z.coerce.number().int().positive(),
  valor: valorSchema,
  descricao: z.string().trim().min(2).max(180).optional(),
  categoria: z.string().trim().min(1).max(80).optional(),
  categoryId: optionalCategoryId,
  data: dateSchema.optional(),
  observacao: z.string().trim().max(500).optional(),
  status: statusSchema.optional(),
})

router.post('/transfer', requireAuth, async (req, res) => {
  try {
    const payload = TransferSchema.parse(req.body)

    if (payload.fromAccountId === payload.toAccountId) {
      return res.status(422).json({ error: 'Selecione contas diferentes para transferência' })
    }

    const [fromAccount, toAccount] = await Promise.all([
      prisma.account.findFirst({ where: { id: payload.fromAccountId, userId: req.user.id } }),
      prisma.account.findFirst({ where: { id: payload.toAccountId, userId: req.user.id } }),
    ])

    if (!fromAccount || !toAccount) {
      return res.status(404).json({ error: 'Conta não encontrada' })
    }

    if (fromAccount.archivedAt || toAccount.archivedAt) {
      return res.status(409).json({ error: 'Contas arquivadas não suportam transferências' })
    }

    let categoriaNome = payload.categoria?.trim()
    let categoriaId = payload.categoryId ?? null
    if (categoriaId) {
      const category = await prisma.category.findFirst({ where: { id: categoriaId, userId: req.user.id } })
      if (!category) {
        return res.status(404).json({ error: 'Categoria não encontrada' })
      }
      categoriaNome = category.name
    }

    if (!categoriaNome) {
      categoriaNome = 'Transferência'
    }

    const descricaoBase = payload.descricao?.trim() || `Transferência entre contas`
    const observacao = payload.observacao?.trim()
    const status = payload.status ?? 'confirmado'
    const data = payload.data ?? new Date()

    const isValidPositive = typeof payload.valor.lessThanOrEqualTo === 'function'
      ? !payload.valor.lessThanOrEqualTo(0)
      : Number(payload.valor) > 0

    if (!isValidPositive) {
      return res.status(422).json({ error: 'Valor deve ser maior que zero' })
    }

    const [saida, entrada] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          accountId: fromAccount.id,
          descricao: `${descricaoBase} (saída)`,
          categoria: categoriaNome,
          categoryId: categoriaId,
          valor: payload.valor,
          tipo: 'despesa',
          status,
          data,
          observacao,
        },
        include: {
          account: { select: { id: true, name: true, color: true, isDefault: true, archivedAt: true } },
          category: { select: { id: true, name: true, color: true } },
        },
      }),
      prisma.transaction.create({
        data: {
          accountId: toAccount.id,
          descricao: `${descricaoBase} (entrada)`,
          categoria: categoriaNome,
          categoryId: categoriaId,
          valor: payload.valor,
          tipo: 'receita',
          status,
          data,
          observacao,
        },
        include: {
          account: { select: { id: true, name: true, color: true, isDefault: true, archivedAt: true } },
          category: { select: { id: true, name: true, color: true } },
        },
      }),
    ])

    res.status(201).json({
      transfer: {
        debito: serializeTransaction(saida),
        credito: serializeTransaction(entrada),
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: 'Dados inválidos', issues: error.flatten() })
    }
    console.error('Transfer transaction error:', error)
    return res.status(500).json({ error: 'Falha ao registrar transferência' })
  }
})

export default router
