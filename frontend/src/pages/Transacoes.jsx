import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTheme } from '../contexts/ThemeContext.jsx'
import api from '../services/api.js'
import { formatarDataISOParaBR, formatarMoedaBRL } from '../utils/formatadores.js'
import {
  Plus,
  UploadCloud,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Edit,
  Trash2,
  Calendar,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Wallet,
  Archive,
  Repeat,
  Clock4,
  RefreshCcw,
  Pause,
  Tag,
} from 'lucide-react'

const CATEGORIAS_SUGERIDAS = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Saúde',
  'Educação',
  'Lazer',
  'Trabalho',
  'Investimentos',
  'Vendas',
  'Outros'
]

const TIPO_OPTIONS = [
  { value: '', label: 'Todos os tipos' },
  { value: 'receita', label: 'Receitas' },
  { value: 'despesa', label: 'Despesas' }
]

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'pendente', label: 'Pendente' }
]

const FREQUENCIA_OPTIONS = [
  { value: 'daily', label: 'Diária' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'yearly', label: 'Anual' },
]

const SORT_OPTIONS = [
  { value: 'data:desc', label: 'Data (mais recentes)' },
  { value: 'data:asc', label: 'Data (mais antigas)' },
  { value: 'valor:desc', label: 'Valor (maior primeiro)' },
  { value: 'valor:asc', label: 'Valor (menor primeiro)' },
  { value: 'createdAt:desc', label: 'Cadastro recente' },
  { value: 'createdAt:asc', label: 'Cadastro antigo' },
]

const PER_PAGE_OPTIONS = [10, 20, 50]

const SERVER_FILTER_DEFAULTS = {
  accountId: '',
  tipo: '',
  status: '',
  from: '',
  to: '',
  sortBy: 'data',
  sortOrder: 'desc',
}

const PAGINATION_DEFAULT = { page: 1, perPage: 10 }

export default function Transacoes() {
  const { isDark } = useTheme()
  const [transacoes, setTransacoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [accounts, setAccounts] = useState([])
  const [meta, setMeta] = useState(null)
    const [categorias, setCategorias] = useState([])
    const [categoriasCarregando, setCategoriasCarregando] = useState(false)
  const [filtros, setFiltros] = useState({
    busca: '',
    categoria: '',
  })
  const [serverFilters, setServerFilters] = useState(() => ({ ...SERVER_FILTER_DEFAULTS }))
  const [pagination, setPagination] = useState(() => ({ ...PAGINATION_DEFAULT }))
  const [modalAberto, setModalAberto] = useState(false)
  const hojeISO = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [form, setForm] = useState({
    id: null,
    accountId: '',
    descricao: '',
    categoria: '',
  categoryId: '',
    valor: '',
    tipo: 'despesa',
    status: 'confirmado',
    data: hojeISO,
    observacao: '',
  })
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState('')
  const [mensagemSucesso, setMensagemSucesso] = useState('')
  const [transacaoEmEdicao, setTransacaoEmEdicao] = useState(null)
  const [transacaoProcessandoId, setTransacaoProcessandoId] = useState(null)
  const [importModalAberto, setImportModalAberto] = useState(false)
  const [importArquivo, setImportArquivo] = useState(null)
  const [importConfig, setImportConfig] = useState({
    accountId: '',
    status: 'confirmado',
    defaultTipo: 'auto',
    defaultCategoria: '',
  })
  const [importResultado, setImportResultado] = useState(null)
  const [importErros, setImportErros] = useState([])
  const [importAvisos, setImportAvisos] = useState([])
  const [importando, setImportando] = useState(false)
  const [erroImportacao, setErroImportacao] = useState('')
  const [recorrentes, setRecorrentes] = useState([])
  const [recorrentesCarregando, setRecorrentesCarregando] = useState(false)
  const [erroRecorrentes, setErroRecorrentes] = useState('')
  const [recorrenteModalAberto, setRecorrenteModalAberto] = useState(false)
  const [recorrenteForm, setRecorrenteForm] = useState({
    id: null,
    descricao: '',
    valor: '',
    tipo: 'despesa',
    status: 'confirmado',
    categoria: '',
    categoryId: '',
    accountId: '',
    frequency: 'monthly',
    interval: '1',
    startDate: hojeISO,
    endDate: '',
    maxExecutions: '',
    autoAdjustDay: true,
    observacao: '',
  })
  const [recorrenteSalvando, setRecorrenteSalvando] = useState(false)
  const [recorrenteErroForm, setRecorrenteErroForm] = useState('')
  const [recorrenteEmEdicao, setRecorrenteEmEdicao] = useState(null)
  const [recorrenteProcessandoId, setRecorrenteProcessandoId] = useState(null)
  const [processandoPendentes, setProcessandoPendentes] = useState(false)

  const activeAccounts = useMemo(() => accounts.filter((conta) => !conta.archivedAt), [accounts])
  const archivedAccounts = useMemo(() => accounts.filter((conta) => conta.archivedAt), [accounts])
  const accountOptions = useMemo(() => {
    const ordenar = (lista) => [...lista].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    return [...ordenar(activeAccounts), ...ordenar(archivedAccounts)]
  }, [activeAccounts, archivedAccounts])
  const hasArchivedAccounts = archivedAccounts.length > 0
  const archivedNamesPreview = useMemo(() => archivedAccounts.slice(0, 3).map((conta) => conta.name).join(', '), [archivedAccounts])
  const filteredAccount = useMemo(
    () => accountOptions.find((conta) => String(conta.id) === serverFilters.accountId),
    [accountOptions, serverFilters.accountId]
  )
  const selectedAccount = useMemo(
    () => accountOptions.find((conta) => String(conta.id) === form.accountId),
    [accountOptions, form.accountId]
  )
  const modalEditLocked = Boolean(transacaoEmEdicao && selectedAccount?.archivedAt)
  const modalCreateLocked = !transacaoEmEdicao && activeAccounts.length === 0

  // Categorias dinâmicas baseadas nas transações existentes
  const categoriasDisponiveis = useMemo(() => {
    const dinamicas = transacoes.map((t) => t.categoria).filter(Boolean)
    const gerenciaveis = categorias.map((cat) => cat.name)
    const merged = new Set([...CATEGORIAS_SUGERIDAS, ...gerenciaveis, ...dinamicas])
    return Array.from(merged).sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [transacoes, categorias])

  // Conta padrão para o formulário
  const defaultAccountId = useMemo(() => {
    if (!activeAccounts.length) return ''
    const preferencial = activeAccounts.find((conta) => conta.isDefault)
    return String((preferencial ?? activeAccounts[0]).id)
  }, [activeAccounts])

  // Atualizar accountId quando contas carregarem
  useEffect(() => {
    if (defaultAccountId) {
      setForm((prev) => ({
        ...prev,
        accountId: prev.accountId || defaultAccountId,
      }))
      setImportConfig((prev) => ({
        ...prev,
        accountId: prev.accountId || defaultAccountId,
      }))
      setRecorrenteForm((prev) => ({
        ...prev,
        accountId: prev.accountId || defaultAccountId,
      }))
    }
  }, [defaultAccountId])

  const fetchAccounts = useCallback(async () => {
    try {
      const { data } = await api.accounts.list({ includeArchived: true })
      setAccounts(data?.accounts ?? [])
    } catch (err) {
      console.error('Erro ao carregar contas:', err)
    }
  }, [])

  const fetchCategorias = useCallback(async () => {
    setCategoriasCarregando(true)
    try {
      const { data } = await api.categories.list()
      setCategorias(data?.categories ?? [])
    } catch (err) {
      console.error('Erro ao carregar categorias:', err)
      setCategorias([])
    } finally {
      setCategoriasCarregando(false)
    }
  }, [])

  const fetchTransacoes = useCallback(async () => {
    setCarregando(true)
    setErro('')

    const params = {
      page: pagination.page,
      perPage: pagination.perPage,
      sortBy: serverFilters.sortBy,
      sortOrder: serverFilters.sortOrder,
    }

    if (serverFilters.accountId) params.accountId = Number(serverFilters.accountId)
    if (serverFilters.tipo) params.tipo = serverFilters.tipo
    if (serverFilters.status) params.status = serverFilters.status
    if (serverFilters.from) params.from = serverFilters.from
    if (serverFilters.to) params.to = serverFilters.to

    try {
      const { data } = await api.transacoes.listar(params)
      const metaResponse = data?.meta ?? null

      if (metaResponse?.totalPages && pagination.page > metaResponse.totalPages && metaResponse.totalPages >= 1) {
        setPagination((prev) => ({ ...prev, page: metaResponse.totalPages }))
        return
      }

      setTransacoes(data?.transactions ?? [])
      setMeta(metaResponse)
    } catch (err) {
      console.error('Erro ao carregar transações:', err)
      const message = err?.response?.data?.error ?? 'Erro ao conectar com o servidor'
      setErro(message)
      setTransacoes([])
      setMeta(null)
    } finally {
      setCarregando(false)
    }
  }, [pagination.page, pagination.perPage, serverFilters])

  const fetchRecorrentes = useCallback(async () => {
    setRecorrentesCarregando(true)
    setErroRecorrentes('')
    try {
      const { data } = await api.transacoes.recorrentes.listar()
      setRecorrentes(Array.isArray(data?.recurringTransactions) ? data.recurringTransactions : [])
    } catch (err) {
      console.error('Erro ao carregar recorrências:', err)
      const message = err?.response?.data?.error ?? 'Não foi possível carregar as transações recorrentes.'
      setErroRecorrentes(message)
      setRecorrentes([])
    } finally {
      setRecorrentesCarregando(false)
    }
  }, [])

  useEffect(() => {
    fetchAccounts()
    fetchCategorias()
  }, [fetchAccounts, fetchCategorias])

  useEffect(() => {
    fetchTransacoes()
  }, [fetchTransacoes])

  useEffect(() => {
    fetchRecorrentes()
  }, [fetchRecorrentes])

  // Filtros com useMemo
  const transacoesFiltradas = useMemo(() => {
    const termo = filtros.busca.trim().toLowerCase()

    return transacoes.filter((transacao) => {
      const matchBusca =
        !termo ||
        transacao.descricao?.toLowerCase().includes(termo) ||
        transacao.categoria?.toLowerCase().includes(termo)

      const matchCategoria = !filtros.categoria || transacao.categoria === filtros.categoria

      return matchBusca && matchCategoria
    })
  }, [transacoes, filtros])

  // Resumo do mês
  const resumoPagina = useMemo(() => {
    const receitas = transacoesFiltradas
      .filter((t) => t.tipo === 'receita')
      .reduce((acc, t) => acc + (Number(t.valor) || 0), 0)

    const despesas = transacoesFiltradas
      .filter((t) => t.tipo === 'despesa')
      .reduce((acc, t) => acc + (Number(t.valor) || 0), 0)

    return {
      receitas,
      despesas,
      saldo: receitas - despesas,
    }
  }, [transacoesFiltradas])

  const recorrentesAtivos = useMemo(() => recorrentes.filter((item) => item.isActive), [recorrentes])
  const recorrenciasPendentes = useMemo(
    () => recorrentesAtivos.filter((item) => item.nextRun && item.nextRun <= hojeISO),
    [recorrentesAtivos, hojeISO]
  )
  const temPendenciasRecorrentes = recorrenciasPendentes.length > 0

  const totalRegistros = meta?.total ?? transacoesFiltradas.length
  const totalPaginas = meta?.totalPages ?? 1

  const handleServerFilterChange = (campo, valor) => {
    setServerFilters((prev) => ({ ...prev, [campo]: valor }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleSortChange = (valor) => {
    const [sortBy, sortOrder] = valor.split(':')
    setServerFilters((prev) => ({ ...prev, sortBy, sortOrder }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleChangePerPage = (value) => {
    setPagination({ page: 1, perPage: value })
  }

  const handleChangePage = (page) => {
    const destino = Math.min(Math.max(page, 1), totalPaginas || 1)
    setPagination((prev) => (prev.page === destino ? prev : { ...prev, page: destino }))
  }

  const limparFiltros = () => {
    setFiltros({ busca: '', categoria: '' })
    setServerFilters({ ...SERVER_FILTER_DEFAULTS })
    setPagination({ ...PAGINATION_DEFAULT })
  }

  const normalizarValorMonetario = (valor) => {
    if (typeof valor === 'number') return valor
    const texto = `${valor ?? ''}`.trim()
    if (!texto) return NaN
    let normalized = texto.replace(/\s/g, '')
    if (normalized.includes(',') && normalized.includes('.')) {
      normalized = normalized.replace(/\./g, '').replace(',', '.')
    } else if (normalized.includes(',')) {
      normalized = normalized.replace(',', '.')
    }
    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : NaN
  }

  const labelFrequencia = (valor) => FREQUENCIA_OPTIONS.find((option) => option.value === valor)?.label ?? valor

  const descricaoFrequencia = (item) => {
    const base = labelFrequencia(item.frequency)
    if (!item.interval || Number(item.interval) === 1) return base
    return `${base} (a cada ${item.interval})`
  }

  const resetRecorrenteForm = useCallback(
    (overrides = {}) => {
      setRecorrenteForm({
        id: overrides.id ?? null,
        descricao: overrides.descricao ?? '',
        valor: overrides.valor ?? '',
        tipo: overrides.tipo ?? 'despesa',
        status: overrides.status ?? 'confirmado',
        categoria: overrides.categoria ?? '',
        categoryId: overrides.categoryId ?? '',
        accountId: overrides.accountId ?? (defaultAccountId || ''),
        frequency: overrides.frequency ?? 'monthly',
        interval: overrides.interval ?? '1',
        startDate: overrides.startDate ?? hojeISO,
        endDate: overrides.endDate ?? '',
        maxExecutions: overrides.maxExecutions ?? '',
        autoAdjustDay: overrides.autoAdjustDay ?? true,
        observacao: overrides.observacao ?? '',
      })
    },
    [defaultAccountId, hojeISO]
  )

  const abrirModalRecorrencia = (recorrencia = null) => {
    if (!recorrencia && activeAccounts.length === 0) {
      setErroRecorrentes('Crie ou restaure uma conta ativa em Configurações > Contas para cadastrar recorrências.')
      return
    }
    setRecorrenteErroForm('')
    setMensagemSucesso('')
    if (recorrencia) {
      setRecorrenteEmEdicao(recorrencia)
      resetRecorrenteForm({
        id: recorrencia.id,
        descricao: recorrencia.descricao,
        valor: Number(recorrencia.valor ?? 0).toFixed(2).replace('.', ','),
        tipo: recorrencia.tipo,
        status: recorrencia.status ?? 'confirmado',
        categoria: recorrencia.categoria ?? '',
        categoryId: recorrencia.categoryId ? String(recorrencia.categoryId) : '',
        accountId: String(recorrencia.accountId),
        frequency: recorrencia.frequency,
        interval: String(recorrencia.interval ?? 1),
        startDate: recorrencia.startDate ?? hojeISO,
        endDate: recorrencia.endDate ?? '',
        maxExecutions: recorrencia.maxExecutions ? String(recorrencia.maxExecutions) : '',
        autoAdjustDay: recorrencia.autoAdjustDay !== false,
        observacao: recorrencia.observacao ?? '',
      })
    } else {
      setRecorrenteEmEdicao(null)
      resetRecorrenteForm()
    }
    setRecorrenteModalAberto(true)
  }

  const fecharModalRecorrencia = () => {
    if (recorrenteSalvando) return
    setRecorrenteModalAberto(false)
    setRecorrenteEmEdicao(null)
  }

  const handleChangeRecorrente = (campo, valor) => {
    setRecorrenteForm((prev) => ({ ...prev, [campo]: valor }))
  }

  const handleSubmitRecorrente = async (event) => {
    event.preventDefault()
    if (recorrenteSalvando) return

    const accountIdNumber = Number(recorrenteForm.accountId)
    if (!Number.isFinite(accountIdNumber) || accountIdNumber <= 0) {
      setRecorrenteErroForm('Selecione uma conta válida.')
      return
    }

    const valorNumber = normalizarValorMonetario(recorrenteForm.valor)
    if (!Number.isFinite(valorNumber) || valorNumber <= 0) {
      setRecorrenteErroForm('Informe um valor válido maior que zero.')
      return
    }

    const intervalNumber = Math.max(1, Number(recorrenteForm.interval) || 1)
    const categoryIdNumber = recorrenteForm.categoryId ? Number(recorrenteForm.categoryId) : undefined
    if (Number.isNaN(categoryIdNumber)) {
      setRecorrenteErroForm('Categoria selecionada é inválida.')
      return
    }

    const payload = {
      descricao: recorrenteForm.descricao.trim(),
      valor: valorNumber,
      tipo: recorrenteForm.tipo,
      status: recorrenteForm.status,
      accountId: accountIdNumber,
      frequency: recorrenteForm.frequency,
      interval: intervalNumber,
      startDate: recorrenteForm.startDate,
      autoAdjustDay: Boolean(recorrenteForm.autoAdjustDay),
    }

    if (recorrenteForm.observacao.trim()) payload.observacao = recorrenteForm.observacao.trim()
    if (recorrenteForm.endDate) payload.endDate = recorrenteForm.endDate
    const maxExecutionsNumber = Number(recorrenteForm.maxExecutions)
    if (Number.isFinite(maxExecutionsNumber) && maxExecutionsNumber > 0) {
      payload.maxExecutions = maxExecutionsNumber
    }
    if (categoryIdNumber) payload.categoryId = categoryIdNumber
    if (!categoryIdNumber && recorrenteForm.categoria.trim()) payload.categoria = recorrenteForm.categoria.trim()

    setRecorrenteErroForm('')
    setRecorrenteSalvando(true)

    try {
      if (recorrenteEmEdicao) {
        await api.transacoes.recorrentes.atualizar(recorrenteEmEdicao.id, payload)
        setMensagemSucesso('Recorrência atualizada com sucesso!')
      } else {
        await api.transacoes.recorrentes.criar(payload)
        setMensagemSucesso('Recorrência criada com sucesso!')
      }

      setRecorrenteModalAberto(false)
      setRecorrenteEmEdicao(null)
      resetRecorrenteForm()
      await fetchRecorrentes()
      await fetchTransacoes()
    } catch (err) {
      console.error('Erro ao salvar recorrência:', err)
      const message = err?.response?.data?.error ?? 'Não foi possível salvar a transação recorrente.'
      setRecorrenteErroForm(message)
    } finally {
      setRecorrenteSalvando(false)
    }
  }

  const handleExecutarRecorrente = async (recorrencia) => {
    if (!recorrencia?.id) return
    setRecorrenteProcessandoId(recorrencia.id)
    setErroRecorrentes('')
    try {
      const { data } = await api.transacoes.recorrentes.executar(recorrencia.id)
      const gerados = data?.processed ?? 0
      setMensagemSucesso(gerados ? `Recorrência executada: ${gerados} lançamento(s) criado(s).` : 'Nenhum lançamento estava pendente para esta recorrência.')
      await fetchRecorrentes()
      if (gerados > 0) {
        await fetchTransacoes()
      }
    } catch (err) {
      console.error('Erro ao executar recorrência:', err)
      const message = err?.response?.data?.error ?? 'Não foi possível executar a recorrência.'
      setErroRecorrentes(message)
    } finally {
      setRecorrenteProcessandoId(null)
    }
  }

  const handleRemoverRecorrente = async (recorrencia) => {
    if (!recorrencia?.id) return
    if (!window.confirm(`Remover a recorrência "${recorrencia.descricao}"?`)) return
    try {
      await api.transacoes.recorrentes.remover(recorrencia.id)
      setMensagemSucesso('Recorrência desativada com sucesso.')
      await fetchRecorrentes()
    } catch (err) {
      console.error('Erro ao remover recorrência:', err)
      const message = err?.response?.data?.error ?? 'Não foi possível remover a recorrência.'
      setErroRecorrentes(message)
    }
  }

  const handleProcessarPendencias = async () => {
    setProcessandoPendentes(true)
    setErroRecorrentes('')
    try {
      const { data } = await api.transacoes.recorrentes.processarPendentes()
      const total = data?.processed ?? 0
      setMensagemSucesso(total ? `${total} lançamento(s) gerado(s) a partir das recorrências pendentes.` : 'Nenhuma recorrência pendente no momento.')
      if (total > 0) {
        await fetchTransacoes()
      }
      await fetchRecorrentes()
    } catch (err) {
      console.error('Erro ao processar recorrências:', err)
      const message = err?.response?.data?.error ?? 'Não foi possível processar as recorrências pendentes.'
      setErroRecorrentes(message)
    } finally {
      setProcessandoPendentes(false)
    }
  }

  const iniciarEdicaoTransacao = (transacao) => {
    setTransacaoEmEdicao(transacao)
    setErroForm('')
    setMensagemSucesso('')
    setForm({
      id: transacao.id,
      accountId: String(transacao.accountId),
      descricao: transacao.descricao,
      categoria: transacao.categoria,
      categoryId: transacao.categoryId ? String(transacao.categoryId) : '',
      valor: transacao.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '',
      tipo: transacao.tipo,
      status: transacao.status,
      data: transacao.data,
      observacao: transacao.observacao ?? '',
    })
    setModalAberto(true)
  }

  const handleDeleteTransacao = async (transacao) => {
    if (!window.confirm(`Remover a transação "${transacao.descricao}"?`)) return
    try {
      setErro('')
      setTransacaoProcessandoId(transacao.id)
      await api.transacoes.remover(transacao.id)
      setMensagemSucesso('Transação removida com sucesso.')
      await fetchTransacoes()
    } catch (err) {
      console.error('Erro ao remover transação:', err)
      const message = err?.response?.data?.error ?? 'Não foi possível remover a transação'
      setErro(message)
    } finally {
      setTransacaoProcessandoId(null)
    }
  }

  const abrirModalImportacao = () => {
    if (activeAccounts.length === 0) {
      setErro('Crie ou restaure uma conta ativa em Configurações > Contas para importar transações.')
      return
    }
    setErroImportacao('')
    setImportResultado(null)
    setImportErros([])
    setImportAvisos([])
    setImportArquivo(null)
    setImportConfig({
      accountId: defaultAccountId,
      status: 'confirmado',
      defaultTipo: 'auto',
      defaultCategoria: '',
    })
    setImportModalAberto(true)
  }

  const fecharModalImportacao = () => {
    if (importando) return
    setImportModalAberto(false)
  }

  const handleArquivoImportacao = (event) => {
    const file = event.target.files?.[0] ?? null
    setImportArquivo(file)
  }

  const handleChangeImportConfig = (campo, valor) => {
    setImportConfig((prev) => ({ ...prev, [campo]: valor }))
  }

  const handleSubmitImportacao = async (event) => {
    event.preventDefault()
    if (importando) return

    if (!importArquivo) {
      setErroImportacao('Selecione um arquivo CSV antes de importar.')
      return
    }

    setErroImportacao('')
    setImportResultado(null)
    setImportErros([])
    setImportAvisos([])
    setImportando(true)

    try {
      const formData = new FormData()
      formData.append('file', importArquivo)
      if (importConfig.accountId) formData.append('accountId', importConfig.accountId)
      if (importConfig.status) formData.append('status', importConfig.status)
      if (importConfig.defaultTipo) formData.append('defaultTipo', importConfig.defaultTipo)
      if (importConfig.defaultCategoria.trim()) formData.append('defaultCategoria', importConfig.defaultCategoria.trim())

      const { data } = await api.transacoes.importar(formData)
      setImportResultado({
        imported: data?.imported ?? 0,
        processed: data?.processed ?? 0,
        ignored: data?.ignored ?? 0,
        duplicates: data?.duplicates ?? 0,
        adjustedSigns: data?.adjustedSigns ?? 0,
      })
      setImportAvisos(Array.isArray(data?.warnings) ? data.warnings : [])
      setImportErros(Array.isArray(data?.errors) ? data.errors : [])

      if (data?.imported) {
        setMensagemSucesso(`Importação concluída: ${data.imported} transações adicionadas.`)
        await fetchTransacoes()
      }
    } catch (err) {
      console.error('Erro ao importar CSV:', err)
      const message = err?.response?.data?.error ?? 'Falha ao importar arquivo. Confira o formato e tente novamente.'
      setErroImportacao(message)
    } finally {
      setImportando(false)
    }
  }

  const primeiroItem = transacoesFiltradas.length ? (pagination.perPage * (pagination.page - 1)) + 1 : 0
  const ultimoItem = transacoesFiltradas.length ? primeiroItem + transacoesFiltradas.length - 1 : 0

  // Funções do modal
  const abrirModalNovaTransacao = () => {
    if (activeAccounts.length === 0) {
      setErro('Crie ou restaure uma conta ativa em Configurações > Contas para registrar novas transações.')
      return
    }
    setErroForm('')
    setMensagemSucesso('')
    setTransacaoEmEdicao(null)
    setForm({
      id: null,
      accountId: defaultAccountId,
      descricao: '',
      categoria: '',
      categoryId: '',
      valor: '',
      tipo: 'despesa',
      status: 'confirmado',
      data: hojeISO,
      observacao: '',
    })
    setModalAberto(true)
  }

  const fecharModal = () => {
    if (salvando) return
    setModalAberto(false)
    setTransacaoEmEdicao(null)
  }

  const onInputChange = (event) => {
    const { name, value } = event.target
    if (name === 'categoryId') {
      const categoriaSelecionada = categorias.find((cat) => String(cat.id) === value)
      setForm((prev) => ({
        ...prev,
        categoryId: value,
        categoria: categoriaSelecionada ? categoriaSelecionada.name : prev.categoria,
      }))
      return
    }

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitNovaTransacao = async (event) => {
    event.preventDefault()
    if (salvando) return

    setErroForm('')

    const accountIdNumber = Number(form.accountId)
    const valorNumber = normalizarValorMonetario(form.valor)

    if (!accountIdNumber) {
      setErroForm('Selecione uma conta.')
      return
    }

    if (!form.descricao.trim()) {
      setErroForm('Informe a descrição da transação.')
      return
    }

    if (!Number.isFinite(valorNumber) || valorNumber <= 0) {
      setErroForm('Informe um valor válido (maior que zero).')
      return
    }

    const isEdit = Boolean(form.id)
    const contaSelecionada = accounts.find((conta) => conta.id === accountIdNumber)

    if (!contaSelecionada) {
      setErroForm('Conta selecionada não encontrada. Restaure ou atualize a página.')
      return
    }

    if (!isEdit && contaSelecionada.archivedAt) {
      setErroForm('Contas arquivadas não aceitam novas transações. Escolha uma conta ativa.')
      return
    }

    if (isEdit && contaSelecionada.archivedAt) {
      setErroForm('Transações vinculadas a contas arquivadas são somente leitura. Restaure ou migre a conta para editar.')
      return
    }

    setSalvando(true)

    try {
      const categoryId = form.categoryId ? Number(form.categoryId) : undefined

      const basePayload = {
        descricao: form.descricao.trim(),
        categoria: form.categoria.trim() || (categoryId ? undefined : 'Outros'),
        categoryId,
        valor: valorNumber,
        tipo: form.tipo,
        status: form.status,
        data: form.data || hojeISO,
        observacao: form.observacao?.trim() || undefined,
      }

  if (isEdit) {
        await api.transacoes.atualizar(form.id, basePayload)
        setMensagemSucesso('Transação atualizada com sucesso!')
      } else {
        await api.transacoes.criar({ ...basePayload, accountId: accountIdNumber })
        setMensagemSucesso('Transação registrada com sucesso!')
      }

      setModalAberto(false)
      setTransacaoEmEdicao(null)
      setForm({
        id: null,
        accountId: defaultAccountId,
        descricao: '',
        categoria: '',
        categoryId: '',
        valor: '',
        tipo: 'despesa',
        status: 'confirmado',
        data: hojeISO,
        observacao: '',
      })

      if (!isEdit && pagination.page !== 1) {
        setPagination((prev) => ({ ...prev, page: 1 }))
      } else {
        await fetchTransacoes()
      }
    } catch (err) {
      const message = err?.response?.data?.error ?? 'Não foi possível salvar a transação'
      setErroForm(message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className={`min-h-screen p-4 md:p-6 transition-colors duration-300 ${
      isDark
        ? 'bg-slate-950 text-slate-100'
        : 'bg-gradient-to-br from-slate-100 via-sky-100/50 to-indigo-100/40 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <h1 className="mb-3 text-4xl font-bold drop-shadow-sm transition-colors duration-300 md:text-5xl text-slate-900 dark:text-slate-100">
              Transações
            </h1>
            <p className="text-lg font-medium transition-colors duration-300 text-slate-700 dark:text-slate-300">
              Gerencie suas receitas e despesas
            </p>
          </div>
          <div className="mx-auto flex w-full flex-col gap-3 sm:mx-0 sm:w-auto sm:flex-row">
            <button
              onClick={() => abrirModalRecorrencia()}
              className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-6 py-3 font-semibold text-slate-700 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-xl sm:mx-0 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              <Repeat className="h-5 w-5" />
              Nova recorrência
            </button>
            <button
              onClick={abrirModalImportacao}
              className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-6 py-3 font-semibold text-slate-700 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-xl sm:mx-0 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              <UploadCloud className="h-5 w-5" />
              Importar CSV
            </button>
            <button
              onClick={abrirModalNovaTransacao}
              className="flex items-center justify-center gap-3 rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-slate-800 hover:shadow-xl dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 dark:hover:shadow-slate-100/40"
            >
              <Plus className="h-5 w-5" />
              Nova Transação
            </button>
          </div>
        </div>

        {/* Mensagens de Sucesso/Erro */}
        {mensagemSucesso && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
            {mensagemSucesso}
          </div>
        )}

        {erro && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
            {erro}
          </div>
        )}

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-white/50 bg-white/30 p-8 shadow-xl backdrop-blur-lg transition-all duration-300 hover:scale-[1.02] hover:bg-white/40 dark:border-slate-700 dark:bg-slate-900/70 dark:hover:bg-slate-900/75">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-2 text-sm font-bold text-gray-700 dark:text-slate-300">Receitas desta página</p>
                <p className="text-3xl font-bold text-emerald-600 drop-shadow-sm dark:text-emerald-400">{formatarMoedaBRL(resumoPagina.receitas)}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
          
          <div className="rounded-3xl border border-white/50 bg-white/30 p-8 shadow-xl backdrop-blur-lg transition-all duration-300 hover:scale-[1.02] hover:bg-white/40 dark:border-slate-700 dark:bg-slate-900/70 dark:hover:bg-slate-900/75">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-2 text-sm font-bold text-gray-700 dark:text-slate-300">Despesas desta página</p>
                <p className="text-3xl font-bold text-rose-600 drop-shadow-sm dark:text-rose-400">{formatarMoedaBRL(resumoPagina.despesas)}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingDown className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
          
          <div className="rounded-3xl border border-white/50 bg-white/30 p-8 shadow-xl backdrop-blur-lg transition-all duration-300 hover:scale-[1.02] hover:bg-white/40 dark:border-slate-700 dark:bg-slate-900/70 dark:hover:bg-slate-900/75">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-2 text-sm font-bold text-gray-700 dark:text-slate-300">Saldo desta página</p>
                <p className={`text-3xl font-bold drop-shadow-sm ${
                  resumoPagina.saldo >= 0
                    ? 'text-blue-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-rose-400'
                }`}>
                  {formatarMoedaBRL(resumoPagina.saldo)}
                </p>
              </div>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                resumoPagina.saldo >= 0 
                  ? 'bg-gradient-to-br from-blue-400 to-indigo-500' 
                  : 'bg-gradient-to-br from-red-400 to-rose-500'
              }`}>
                <Calendar className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="rounded-3xl border border-white/40 bg-white/25 p-8 shadow-lg backdrop-blur-lg dark:border-slate-700 dark:bg-slate-900/70">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Filtros</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-500 dark:text-slate-400" />
              <input
                type="text"
                placeholder="Buscar descrição ou categoria..."
                value={filtros.busca}
                onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                className="w-full rounded-2xl border border-white/30 bg-white/40 py-3 pl-12 pr-4 text-gray-800 shadow-sm transition-all duration-300 placeholder:text-gray-600 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Categoria</label>
              <select
                value={filtros.categoria}
                onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
                className="w-full rounded-2xl border border-white/30 bg-white/40 px-4 py-3 text-gray-800 shadow-sm transition-all duration-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:ring-blue-400"
              >
                <option value="">Todas as categorias</option>
                {categoriasDisponiveis.map((categoria) => (
                  <option key={categoria} value={categoria}>{categoria}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Conta</label>
              <select
                value={serverFilters.accountId}
                onChange={(e) => handleServerFilterChange('accountId', e.target.value)}
                className="w-full rounded-2xl border border-white/30 bg-white/40 px-4 py-3 text-gray-800 shadow-sm transition-all duration-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:ring-blue-400"
              >
                <option value="">Todas as contas</option>
                {accountOptions.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}{account.archivedAt ? ' • Arquivada' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Tipo</label>
              <select
                value={serverFilters.tipo}
                onChange={(e) => handleServerFilterChange('tipo', e.target.value)}
                className="w-full rounded-2xl border border-white/30 bg-white/40 px-4 py-3 text-gray-800 shadow-sm transition-all duration-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:ring-blue-400"
              >
                {TIPO_OPTIONS.map((option) => (
                  <option key={option.value || '__all-tipo'} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Status</label>
              <select
                value={serverFilters.status}
                onChange={(e) => handleServerFilterChange('status', e.target.value)}
                className="w-full rounded-2xl border border-white/30 bg-white/40 px-4 py-3 text-gray-800 shadow-sm transition-all duration-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:ring-blue-400"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value || '__all-status'} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Data inicial</label>
              <input
                type="date"
                value={serverFilters.from}
                max={serverFilters.to || undefined}
                onChange={(e) => handleServerFilterChange('from', e.target.value)}
                className="w-full rounded-2xl border border-white/30 bg-white/40 px-4 py-3 text-gray-800 shadow-sm transition-all duration-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Data final</label>
              <input
                type="date"
                value={serverFilters.to}
                min={serverFilters.from || undefined}
                onChange={(e) => handleServerFilterChange('to', e.target.value)}
                className="w-full rounded-2xl border border-white/30 bg-white/40 px-4 py-3 text-gray-800 shadow-sm transition-all duration-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Ordenação</label>
              <select
                value={`${serverFilters.sortBy}:${serverFilters.sortOrder}`}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full rounded-2xl border border-white/30 bg-white/40 px-4 py-3 text-gray-800 shadow-sm transition-all duration-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:ring-blue-400"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Itens por página</span>
              <select
                value={String(pagination.perPage)}
                onChange={(e) => handleChangePerPage(Number(e.target.value))}
                className="rounded-xl border border-white/30 bg-white/40 px-3 py-2 text-sm text-gray-800 shadow-sm transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:ring-blue-400"
              >
                {PER_PAGE_OPTIONS.map((option) => (
                  <option key={option} value={String(option)}>{option}</option>
                ))}
              </select>
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {primeiroItem
                  ? `Exibindo ${primeiroItem}-${ultimoItem} de ${totalRegistros}`
                  : 'Nenhum resultado nesta página'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={limparFiltros}
                className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/30 px-4 py-2 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-white/60 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-900/80"
              >
                <ArrowUpDown className="h-4 w-4" />
                Limpar filtros
              </button>
            </div>
          </div>
        </div>

        {filteredAccount?.archivedAt && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-sm text-amber-700 shadow-sm dark:border-amber-500/40 dark:bg-amber-900/20 dark:text-amber-200">
            A conta <strong>{filteredAccount.name}</strong> está arquivada. As transações listadas são somente leitura.
            Utilize a migração em <span className="font-medium">Configurações &gt; Contas</span> para mover os lançamentos ou restaure a conta temporariamente.
          </div>
        )}

        {!filteredAccount?.archivedAt && hasArchivedAccounts && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
            {archivedAccounts.length === 1 ? 'Uma conta arquivada não aceita novas transações.' : `${archivedAccounts.length} contas arquivadas não aceitam novas transações.`}
            {' '}Acesse <span className="font-medium">Configurações &gt; Contas</span> para restaurar ou migrar registros.
            {archivedNamesPreview && archivedAccounts.length <= 3 && ` (${archivedNamesPreview})`}
          </div>
        )}

        {/* Lista de Transações */}
        <div className="overflow-hidden rounded-3xl border border-white/40 bg-white/25 shadow-lg backdrop-blur-lg dark:border-slate-700 dark:bg-slate-900/70">
          <div className="border-b border-white/30 bg-gradient-to-r from-blue-50/60 to-purple-50/60 px-8 py-6 dark:border-slate-700 dark:bg-slate-900/70">
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Lista de Transações ({totalRegistros})</h3>
              {filtros.busca && (
                <span className="text-xs text-slate-600 dark:text-slate-400">{transacoesFiltradas.length} resultados nesta página após a busca.</span>
              )}
            </div>
          </div>
          
          <div className="divide-y divide-white/20 dark:divide-slate-800/60">
            {carregando ? (
              <div className="py-12 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-4 text-sm text-gray-600 dark:text-slate-400">Carregando transações...</p>
              </div>
            ) : transacoesFiltradas.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  {filtros.busca || filtros.categoria || serverFilters.tipo || serverFilters.status || serverFilters.accountId || serverFilters.from || serverFilters.to ? (
                    <Search className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <p className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-2">
                  {filtros.busca || filtros.categoria || serverFilters.tipo || serverFilters.status || serverFilters.accountId || serverFilters.from || serverFilters.to
                    ? 'Nenhuma transação encontrada'
                    : 'Nenhuma transação cadastrada'}
                </p>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  {filtros.busca || filtros.categoria || serverFilters.tipo || serverFilters.status || serverFilters.accountId || serverFilters.from || serverFilters.to
                    ? 'Tente ajustar os filtros para ver mais resultados.'
                    : 'Clique em "Nova Transação" para começar a registrar suas movimentações financeiras.'}
                </p>
              </div>
            ) : (
              transacoesFiltradas.map((transacao) => (
                <div key={transacao.id} className="cursor-pointer p-6 transition-all duration-300 transform hover:scale-[1.01] hover:bg-white/20 dark:hover:bg-slate-800/60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                        transacao.tipo === 'receita' 
                          ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                          : 'bg-gradient-to-br from-red-400 to-rose-500'
                      }`}>
                        {transacao.tipo === 'receita' ? (
                          <ArrowUpRight className="w-7 h-7 text-white" />
                        ) : (
                          <ArrowDownRight className="w-7 h-7 text-white" />
                        )}
                      </div>
                      
                      <div className="ml-5">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="text-lg font-bold text-gray-800 dark:text-slate-100">{transacao.descricao}</p>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            transacao.status === 'confirmado' 
                              ? 'border border-green-200/50 bg-green-100/80 text-green-700 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-300' 
                              : 'border border-yellow-200/50 bg-yellow-100/80 text-yellow-700 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-300'
                          }`}>
                            {transacao.status === 'confirmado' ? 'Confirmado' : 'Pendente'}
                          </span>
                        </div>
                        <p className="font-medium text-gray-600 dark:text-slate-300">
                          {transacao.categoria} • {formatarDataISOParaBR(transacao.data) || '-'}
                        </p>
                        {transacao.account && (
                          <div className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                            <span className="inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: transacao.account.color || '#6366f1' }} />
                            <span className="inline-flex items-center gap-1">
                              <Wallet className="h-3 w-3" />
                              {transacao.account.name}
                            </span>
                            {transacao.account.archivedAt && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-600 dark:border-rose-500/40 dark:bg-rose-500/15 dark:text-rose-200">
                                <Archive className="h-3 w-3" />
                                Conta arquivada
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <span className={`text-xl font-bold ${
                        transacao.tipo === 'receita' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-rose-400'
                      }`}>
                        {transacao.tipo === 'receita' ? '+' : '-'}{formatarMoedaBRL(transacao.valor)}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => iniciarEdicaoTransacao(transacao)}
                          disabled={salvando || transacaoProcessandoId === transacao.id}
                          className="rounded-xl p-3 text-gray-500 transition-all duration-300 transform hover:scale-110 hover:bg-blue-50/50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-200"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTransacao(transacao)}
                          disabled={transacaoProcessandoId === transacao.id}
                          className="rounded-xl p-3 text-gray-500 transition-all duration-300 transform hover:scale-110 hover:bg-red-50/50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-rose-300"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex flex-col gap-3 border-t border-white/20 bg-white/15 px-6 py-4 text-sm text-slate-700 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/40 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
            <span> Página {totalPaginas ? Math.min(pagination.page, totalPaginas) : pagination.page} de {totalPaginas || 1}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleChangePage(pagination.page - 1)}
                disabled={carregando || pagination.page <= 1}
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/30 px-3 py-2 font-medium text-slate-700 transition-all duration-200 hover:bg-white/60 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-900/80"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </button>
              <button
                type="button"
                onClick={() => handleChangePage(pagination.page + 1)}
                disabled={carregando || pagination.page >= totalPaginas}
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/30 px-3 py-2 font-medium text-slate-700 transition-all duration-200 hover:bg-white/60 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-900/80"
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Recorrentes */}
        <div className="overflow-hidden rounded-3xl border border-white/40 bg-white/25 shadow-lg backdrop-blur-lg dark:border-slate-700 dark:bg-slate-900/70">
          <div className="flex flex-col gap-4 border-b border-white/30 bg-gradient-to-r from-purple-50/60 to-indigo-50/60 px-8 py-6 dark:border-slate-700 dark:bg-slate-900/70 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg">
                <Repeat className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Transações Recorrentes ({recorrentes.length})</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {temPendenciasRecorrentes
                    ? `${recorrenciasPendentes.length} recorrência(s) com execução pendente.`
                    : 'Cadastre lançamentos fixos e deixe o MoneyMap automatizar seu fluxo.'}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleProcessarPendencias}
                disabled={processandoPendentes}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-5 py-2 text-sm font-semibold text-slate-700 shadow-md transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                <RefreshCcw className={`h-4 w-4 ${processandoPendentes ? 'animate-spin' : ''}`} />
                {processandoPendentes ? 'Processando...' : 'Processar pendências'}
              </button>
              <button
                type="button"
                onClick={() => abrirModalRecorrencia()}
                className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                <Plus className="h-4 w-4" />
                Nova recorrência
              </button>
            </div>
          </div>

          {erroRecorrentes && (
            <div className="px-8 py-4 text-sm text-rose-600 dark:text-rose-300">
              {erroRecorrentes}
            </div>
          )}

          {recorrentesCarregando ? (
            <div className="py-12 text-center text-sm text-slate-600 dark:text-slate-400">
              Carregando recorrências...
            </div>
          ) : recorrentes.length === 0 ? (
            <div className="px-8 py-10 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-600 dark:from-purple-900/30 dark:to-indigo-900/30 dark:text-purple-300">
                <Repeat className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Nenhuma recorrência cadastrada</h4>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Utilize o botão acima para configurar lançamentos automáticos.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/20 dark:divide-slate-800/60">
              {recorrentes.map((recorrencia) => {
                const isPendente = recorrencia.isActive && recorrencia.nextRun && recorrencia.nextRun <= hojeISO
                const statusChip = (() => {
                  if (!recorrencia.isActive) {
                    return { text: 'Inativa', className: 'border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300', icon: Pause }
                  }
                  if (isPendente) {
                    return { text: 'Execução pendente', className: 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/40 dark:bg-rose-500/15 dark:text-rose-200', icon: Clock4 }
                  }
                  return { text: 'Ativa', className: 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-300', icon: Repeat }
                })()

                return (
                  <div key={recorrencia.id} className="flex flex-col gap-4 px-8 py-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{recorrencia.descricao}</h4>
                        <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${statusChip.className}`}>
                          {React.createElement(statusChip.icon, { className: 'h-3.5 w-3.5' })}
                          {statusChip.text}
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${recorrencia.tipo === 'receita'
                          ? 'border border-emerald-200/60 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                          : 'border border-rose-200/60 bg-rose-50 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200'
                        }`}
                        >
                          {recorrencia.tipo === 'receita' ? 'Receita' : 'Despesa'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1"><Wallet className="h-3.5 w-3.5" />{recorrencia.account?.name ?? 'Conta removida'}</span>
                        <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{descricaoFrequencia(recorrencia)}</span>
                        <span className="inline-flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" />{formatarMoedaBRL(recorrencia.valor)}</span>
                        {recorrencia.categoria && (
                          <span className="inline-flex items-center gap-1">
                            <Tag className="h-3.5 w-3.5" />
                            {recorrencia.categoria}
                          </span>
                        )}
                      </div>
                      {recorrencia.observacao && (
                        <p className="text-sm text-slate-600 dark:text-slate-300">{recorrencia.observacao}</p>
                      )}
                    </div>

                    <div className="flex flex-col items-stretch gap-3 md:w-auto md:flex-row md:items-center">
                      <div className="text-right text-sm text-slate-600 dark:text-slate-300 md:pr-4">
                        <p className="font-semibold text-slate-800 dark:text-slate-100">Próxima execução</p>
                        <p>{recorrencia.nextRun ? formatarDataISOParaBR(recorrencia.nextRun) : 'Sem próxima data'}</p>
                        <p className="text-xs">Executadas: {recorrencia.executedCount}{recorrencia.maxExecutions ? ` / ${recorrencia.maxExecutions}` : ''}</p>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleExecutarRecorrente(recorrencia)}
                          disabled={recorrenteProcessandoId === recorrencia.id || !recorrencia.isActive || !recorrencia.nextRun}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          <Clock4 className="h-4 w-4" />
                          Executar
                        </button>
                        <button
                          type="button"
                          onClick={() => abrirModalRecorrencia(recorrencia)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          <Edit className="h-4 w-4" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoverRecorrente(recorrencia)}
                          className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 transition-all hover:bg-rose-100 dark:border-rose-500/40 dark:bg-rose-500/15 dark:text-rose-200"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remover
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {recorrenteModalAberto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur">
            <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/70">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{recorrenteEmEdicao ? 'Editar recorrência' : 'Nova recorrência'}</h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Configure um lançamento automático com frequência fixa.</p>
                </div>
                <button
                  type="button"
                  onClick={fecharModalRecorrencia}
                  disabled={recorrenteSalvando}
                  className="rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Fechar
                </button>
              </div>

              <form onSubmit={handleSubmitRecorrente} className="space-y-6 px-6 py-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Descrição *</label>
                    <input
                      type="text"
                      value={recorrenteForm.descricao}
                      onChange={(e) => handleChangeRecorrente('descricao', e.target.value)}
                      required
                      maxLength={180}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                      placeholder="Ex: Assinatura de streaming"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Conta *</label>
                    <select
                      value={recorrenteForm.accountId}
                      onChange={(e) => handleChangeRecorrente('accountId', e.target.value)}
                      required
                      disabled={recorrenteSalvando || activeAccounts.length === 0}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-700 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                    >
                      <option value="">Selecione</option>
                      {activeAccounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.name}{account.isDefault ? ' (Padrão)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Valor *</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={recorrenteForm.valor}
                      onChange={(e) => handleChangeRecorrente('valor', e.target.value)}
                      placeholder="0,00"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Tipo *</label>
                    <select
                      value={recorrenteForm.tipo}
                      onChange={(e) => handleChangeRecorrente('tipo', e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                    >
                      <option value="despesa">Despesa</option>
                      <option value="receita">Receita</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Status padrão *</label>
                    <select
                      value={recorrenteForm.status}
                      onChange={(e) => handleChangeRecorrente('status', e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                    >
                      <option value="confirmado">Confirmado</option>
                      <option value="pendente">Pendente</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Frequência *</label>
                    <select
                      value={recorrenteForm.frequency}
                      onChange={(e) => handleChangeRecorrente('frequency', e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                    >
                      {FREQUENCIA_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Intervalo</label>
                    <input
                      type="number"
                      min="1"
                      value={recorrenteForm.interval}
                      onChange={(e) => handleChangeRecorrente('interval', e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                    />
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Número de períodos entre cada lançamento.</p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Data inicial *</label>
                    <input
                      type="date"
                      value={recorrenteForm.startDate}
                      onChange={(e) => handleChangeRecorrente('startDate', e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Data final</label>
                    <input
                      type="date"
                      value={recorrenteForm.endDate}
                      onChange={(e) => handleChangeRecorrente('endDate', e.target.value)}
                      min={recorrenteForm.startDate || undefined}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Limite de execuções</label>
                    <input
                      type="number"
                      min="1"
                      value={recorrenteForm.maxExecutions}
                      onChange={(e) => handleChangeRecorrente('maxExecutions', e.target.value)}
                      placeholder="Opcional"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                    />
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Número máximo de lançamentos que serão gerados.</p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Categoria livre</label>
                    <input
                      type="text"
                      value={recorrenteForm.categoria}
                      onChange={(e) => handleChangeRecorrente('categoria', e.target.value)}
                      maxLength={80}
                      placeholder="Ex: Assinaturas"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Categoria gerenciada</label>
                    <select
                      value={recorrenteForm.categoryId}
                      onChange={(e) => {
                        const value = e.target.value
                        handleChangeRecorrente('categoryId', value)
                        if (value) {
                          const cat = categorias.find((categoria) => String(categoria.id) === value)
                          if (cat) handleChangeRecorrente('categoria', cat.name)
                        }
                      }}
                      disabled={categoriasCarregando}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                    >
                      <option value="">Nenhuma</option>
                      {categorias.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>{categoria.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Observação</label>
                    <textarea
                      value={recorrenteForm.observacao}
                      onChange={(e) => handleChangeRecorrente('observacao', e.target.value)}
                      maxLength={500}
                      rows={3}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                    />
                  </div>

                  <div className="md:col-span-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
                    <input
                      id="autoAdjustDay"
                      type="checkbox"
                      checked={Boolean(recorrenteForm.autoAdjustDay)}
                      onChange={(e) => handleChangeRecorrente('autoAdjustDay', e.target.checked)}
                      className="h-4 w-4 rounded border-slate-400 text-slate-900 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-900"
                    />
                    <label htmlFor="autoAdjustDay" className="flex-1 text-sm">
                      Ajustar automaticamente o dia quando o mês tiver menos dias (ex: 30 → 28/29).
                    </label>
                  </div>
                </div>

                {recorrenteErroForm && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-600/40 dark:bg-rose-900/20 dark:text-rose-200">
                    {recorrenteErroForm}
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={fecharModalRecorrencia}
                    disabled={recorrenteSalvando}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={recorrenteSalvando || activeAccounts.length === 0}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                  >
                    {recorrenteSalvando ? 'Salvando...' : recorrenteEmEdicao ? 'Atualizar recorrência' : 'Criar recorrência'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {importModalAberto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur">
            <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/70">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Importar extrato CSV</h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Suporta colunas como Descrição, Valor, Data, Tipo, Categoria e Conta. Arquivo limitado a 1000 linhas.</p>
                </div>
                <button
                  type="button"
                  onClick={fecharModalImportacao}
                  disabled={importando}
                  className="rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Fechar
                </button>
              </div>

              <form onSubmit={handleSubmitImportacao} className="space-y-6 px-6 py-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Arquivo CSV *</label>
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleArquivoImportacao}
                      disabled={importando}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-slate-800 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:file:bg-slate-100 dark:file:text-slate-900 dark:hover:file:bg-slate-200"
                    />
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Use ponto ou vírgula para decimais. Valores negativos serão interpretados automaticamente.</p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Conta padrão *</label>
                    <select
                      value={importConfig.accountId}
                      onChange={(e) => handleChangeImportConfig('accountId', e.target.value)}
                      required
                      disabled={importando || activeAccounts.length === 0}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-700 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                    >
                      <option value="">Selecione</option>
                      {activeAccounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.name}{account.isDefault ? ' (Padrão)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Status padrão *</label>
                    <select
                      value={importConfig.status}
                      onChange={(e) => handleChangeImportConfig('status', e.target.value)}
                      disabled={importando}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-700 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                    >
                      {STATUS_OPTIONS.filter((option) => option.value).map((option) => (
                        <option key={option.value} value={option.value || 'confirmado'}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Determinar tipo</label>
                    <select
                      value={importConfig.defaultTipo}
                      onChange={(e) => handleChangeImportConfig('defaultTipo', e.target.value)}
                      disabled={importando}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-700 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                    >
                      <option value="auto">Detectar automaticamente</option>
                      <option value="receita">Forçar receita</option>
                      <option value="despesa">Forçar despesa</option>
                    </select>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Quando possível, o tipo é deduzido pelo sinal, mas você pode definir um padrão.</p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Categoria padrão</label>
                    <input
                      type="text"
                      value={importConfig.defaultCategoria}
                      onChange={(e) => handleChangeImportConfig('defaultCategoria', e.target.value)}
                      disabled={importando}
                      maxLength={80}
                      placeholder="Ex: Alimentação"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-700 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                    />
                  </div>
                </div>

                {erroImportacao && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-600/40 dark:bg-rose-900/20 dark:text-rose-200">
                    {erroImportacao}
                  </div>
                )}

                {importResultado && (
                  <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-200">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-white/80 p-3 text-center shadow-sm dark:bg-slate-900/60">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Linhas processadas</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{importResultado.processed}</p>
                      </div>
                      <div className="rounded-2xl bg-white/80 p-3 text-center shadow-sm dark:bg-slate-900/60">
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">Transações importadas</p>
                        <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">{importResultado.imported}</p>
                      </div>
                      <div className="rounded-2xl bg-white/80 p-3 text-center shadow-sm dark:bg-slate-900/60">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Ignoradas / ajustadas</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{importResultado.ignored}</p>
                      </div>
                    </div>
                    {importResultado.adjustedSigns > 0 && (
                      <p className="text-xs text-amber-600 dark:text-amber-300">{importResultado.adjustedSigns} lançamentos tiveram o sinal ajustado para corresponder ao tipo.</p>
                    )}
                  </div>
                )}

                {(importAvisos.length > 0 || importErros.length > 0) && (
                  <div className="space-y-3 rounded-3xl border border-slate-200 bg-white/70 p-4 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
                    {importAvisos.length > 0 && (
                      <div>
                        <p className="mb-2 font-semibold text-amber-600 dark:text-amber-300">Avisos</p>
                        <ul className="space-y-1 max-h-32 overflow-y-auto">
                          {importAvisos.slice(0, 12).map((aviso, index) => (
                            <li key={`${aviso.row}-${index}`} className="rounded-lg bg-amber-50/80 px-3 py-1.5 text-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
                              {aviso.row ? `Linha ${aviso.row}: ` : ''}{aviso.message}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {importErros.length > 0 && (
                      <div>
                        <p className="mb-2 font-semibold text-rose-600 dark:text-rose-300">Erros</p>
                        <ul className="space-y-1 max-h-40 overflow-y-auto">
                          {importErros.slice(0, 12).map((erroItem, index) => (
                            <li key={`${erroItem.row}-${index}`} className="rounded-lg bg-rose-50 px-3 py-1.5 text-rose-700 dark:bg-rose-900/20 dark:text-rose-200">
                              {erroItem.row ? `Linha ${erroItem.row}: ` : ''}{erroItem.message}
                            </li>
                          ))}
                        </ul>
                        {importErros.length > 12 && (
                          <p className="mt-2 text-[11px] text-rose-500 dark:text-rose-300">Exibindo 12 de {importErros.length} erros capturados.</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={fecharModalImportacao}
                    disabled={importando}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={importando || activeAccounts.length === 0}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                  >
                    {importando ? 'Importando...' : 'Importar agora'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal seria implementado aqui - versão demonstrativa */}
        {modalAberto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/30 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-slate-200">
                {transacaoEmEdicao ? 'Editar Transação' : 'Nova Transação'}
              </h2>

              {erroForm && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
                  {erroForm}
                </div>
              )}

              <form onSubmit={handleSubmitNovaTransacao} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                    Conta *
                  </label>
                  <select
                    name="accountId"
                    value={form.accountId}
                    onChange={onInputChange}
                    required
                    disabled={salvando || !!transacaoEmEdicao}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <option value="">Selecione a conta</option>
                    {accountOptions.map((account) => (
                      <option
                        key={account.id}
                        value={account.id}
                        disabled={!transacaoEmEdicao && Boolean(account.archivedAt)}
                      >
                        {account.name}
                        {account.archivedAt ? ' • Arquivada' : account.isDefault ? ' (Padrão)' : ''}
                      </option>
                    ))}
                  </select>
                  {transacaoEmEdicao && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Altere a conta diretamente na lista, recriando a transação se necessário.</p>
                  )}
                  {modalEditLocked && (
                    <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50/80 p-2 text-xs font-medium text-amber-700 dark:border-amber-500/40 dark:bg-amber-900/20 dark:text-amber-200">
                      Esta transação pertence a uma conta arquivada e está bloqueada para edição. Restaure a conta ou utilize a migração para ajustar o lançamento.
                    </p>
                  )}
                  {!transacaoEmEdicao && modalCreateLocked && (
                    <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50/80 p-2 text-xs font-medium text-amber-700 dark:border-amber-500/40 dark:bg-amber-900/20 dark:text-amber-200">
                      Nenhuma conta ativa disponível. Crie ou restaure uma conta em Configurações &gt; Contas para registrar novos lançamentos.
                    </p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                      Tipo *
                    </label>
                    <select
                      name="tipo"
                      value={form.tipo}
                      onChange={onInputChange}
                      required
                      disabled={salvando}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <option value="despesa">Despesa</option>
                      <option value="receita">Receita</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={onInputChange}
                      required
                      disabled={salvando}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <option value="confirmado">Confirmado</option>
                      <option value="pendente">Pendente</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                    Descrição *
                  </label>
                  <input
                    type="text"
                    name="descricao"
                    value={form.descricao}
                    onChange={onInputChange}
                    placeholder="Ex: Supermercado, Salário, etc."
                    required
                    disabled={salvando}
                    maxLength={180}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                      Categoria gerenciada
                    </label>
                    <select
                      name="categoryId"
                      value={form.categoryId}
                      onChange={onInputChange}
                      disabled={salvando || categoriasCarregando}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <option value="">Sem vínculo</option>
                      {categorias.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>{categoria.name}</option>
                      ))}
                    </select>
                    {categoriasCarregando && (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Carregando categorias...</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                      Categoria (texto)
                    </label>
                    <input
                      type="text"
                      name="categoria"
                      value={form.categoria}
                      onChange={onInputChange}
                      list="categorias-sugestoes"
                      placeholder="Selecione ou informe manualmente"
                      disabled={salvando}
                      maxLength={80}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                    />
                    <datalist id="categorias-sugestoes">
                      {categoriasDisponiveis.map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                      Valor *
                    </label>
                    <input
                      type="text"
                      name="valor"
                      value={form.valor}
                      onChange={onInputChange}
                      placeholder="0,00"
                      required
                      disabled={salvando}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                    Data *
                  </label>
                  <input
                    type="date"
                    name="data"
                    value={form.data}
                    onChange={onInputChange}
                    required
                    disabled={salvando}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                    Observação
                  </label>
                  <textarea
                    name="observacao"
                    value={form.observacao}
                    onChange={onInputChange}
                    placeholder="Detalhes adicionais (opcional)"
                    disabled={salvando}
                    maxLength={500}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={fecharModal}
                    disabled={salvando}
                    className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 transition-all duration-300 hover:bg-gray-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={salvando || modalEditLocked || modalCreateLocked}
                    className="flex-1 rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white transition-all duration-300 hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    {salvando ? 'Salvando...' : transacaoEmEdicao ? 'Atualizar Transação' : 'Salvar Transação'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Copyright */}
        <div className="rounded-2xl border border-white/30 bg-white/20 p-4 text-center text-sm font-medium text-gray-600 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
          © 2024 MoneyMapp TCC. Todos os direitos reservados.
        </div>
      </div>
    </div>
  )
}
