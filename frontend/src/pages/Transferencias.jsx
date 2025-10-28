import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { 
  ArrowLeftRight, 
  RefreshCcw, 
  Sparkles, 
  Wallet,
  CreditCard,
  DollarSign,
  Calendar,
  FileText,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  TrendingUp,
  RotateCcw,
  Tag,
  MessageSquare,
  Banknote,
  BarChart3,
  PieChart,
  X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { useTheme } from '../contexts/ThemeContext.jsx'
import api from '../services/api.js'
import { formatarDataISOParaBR, formatarMoedaBRL } from '../utils/formatadores.js'

const STATUS_OPTIONS = [
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'pendente', label: 'Pendente' },
]

const CATEGORIAS_SUGERIDAS = [
  'Transferência',
  'Reserva',
  'Investimento',
  'Aporte',
  'Poupar',
]

function normalizarValor(valor) {
  if (typeof valor === 'number') return valor
  const texto = `${valor ?? ''}`.trim()
  if (!texto) return NaN
  let parsed = texto.replace(/\s/g, '')
  if (parsed.includes(',') && parsed.includes('.')) {
    parsed = parsed.replace(/\./g, '').replace(',', '.')
  } else if (parsed.includes(',')) {
    parsed = parsed.replace(',', '.')
  }
  const numero = Number(parsed)
  return Number.isFinite(numero) ? numero : NaN
}

// Toast moderno para notificações
function Toast({ tipo, mensagem, onClose, autoClose = true }) {
  useEffect(() => {
    if (autoClose && tipo === 'sucesso') {
      const timer = setTimeout(onClose, 3000)
      return () => clearTimeout(timer)
    }
  }, [autoClose, tipo, onClose])

  const config = {
    sucesso: {
      icon: CheckCircle,
      gradient: 'from-emerald-500/10 to-green-500/10',
      border: 'border-emerald-200/30 dark:border-emerald-700/30',
      text: 'text-emerald-700 dark:text-emerald-300',
      iconColor: 'text-emerald-500'
    },
    erro: {
      icon: AlertCircle,
      gradient: 'from-red-500/10 to-rose-500/10',
      border: 'border-red-200/30 dark:border-red-700/30',
      text: 'text-red-700 dark:text-red-300',
      iconColor: 'text-red-500'
    }
  }

  const { icon: Icon, gradient, border, text, iconColor } = config[tipo] || config.erro

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${gradient} backdrop-blur-xl border ${border} p-4 shadow-lg`}
    >
      <div className="flex items-start gap-3">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`p-2 rounded-xl bg-white/20 dark:bg-slate-800/20`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </motion.div>
        <div className="flex-1">
          <p className={`font-semibold ${text}`}>{mensagem}</p>
        </div>
        <button
          onClick={onClose}
          className={`p-1 rounded-lg hover:bg-white/20 dark:hover:bg-slate-800/20 transition-colors ${text}`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}

// Indicador de progresso do formulário
function ProgressIndicator({ form }) {
  const fields = [
    !!form.fromAccountId,
    !!form.toAccountId,
    !!form.valor,
    !!form.categoria,
    !!form.data
  ]
  
  const progress = (fields.filter(Boolean).length / fields.length) * 100

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mb-6"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Progresso do formulário
        </span>
        <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-violet-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  )
}

export default function Transferencias() {
  const { isDark } = useTheme()
  const [accounts, setAccounts] = useState([])
  const [carregandoContas, setCarregandoContas] = useState(true)
  const [categorias, setCategorias] = useState([])
  const [carregandoCategorias, setCarregandoCategorias] = useState(false)
  const [status, setStatus] = useState({ tipo: 'idle', mensagem: '' })
  const [transferencia, setTransferencia] = useState(null)
  const [showToast, setShowToast] = useState(false)

  const hojeISO = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [form, setForm] = useState({
    fromAccountId: '',
    toAccountId: '',
    valor: '',
    descricao: '',
    categoria: 'Transferência',
    categoryId: '',
    data: hojeISO,
    observacao: '',
    status: 'confirmado',
  })

  const categoriasDisponiveis = useMemo(() => {
    const gerenciadas = categorias.map((cat) => cat.name)
    return Array.from(new Set([...CATEGORIAS_SUGERIDAS, ...gerenciadas])).sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [categorias])

  // Auto-show toast when status changes
  useEffect(() => {
    if (status.tipo === 'sucesso' || status.tipo === 'erro') {
      setShowToast(true)
    }
  }, [status])

  const carregarContas = useCallback(async () => {
    setCarregandoContas(true)
    try {
      const { data } = await api.accounts.list()
      const ativas = (data?.accounts ?? []).filter((conta) => !conta.archivedAt)
      setAccounts(ativas)
      if (ativas.length >= 2) {
        setForm((prev) => ({
          ...prev,
          fromAccountId: prev.fromAccountId || String(ativas[0].id),
          toAccountId: prev.toAccountId || String(ativas[1].id),
        }))
      } else if (ativas.length === 1) {
        setForm((prev) => ({ ...prev, fromAccountId: String(ativas[0].id) }))
      }
    } catch (error) {
      console.error('Erro ao carregar contas:', error)
      setStatus({ tipo: 'erro', mensagem: 'Falha ao carregar contas.' })
    } finally {
      setCarregandoContas(false)
    }
  }, [])

  const carregarCategorias = useCallback(async () => {
    setCarregandoCategorias(true)
    try {
      const { data } = await api.categories.list()
      setCategorias(data?.categories ?? [])
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
      setCategorias([])
    } finally {
      setCarregandoCategorias(false)
    }
  }, [])

  useEffect(() => {
    carregarContas()
    carregarCategorias()
  }, [carregarContas, carregarCategorias])

  const handleChange = (event) => {
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

  const inverterContas = () => {
    setForm((prev) => ({
      ...prev,
      fromAccountId: prev.toAccountId,
      toAccountId: prev.fromAccountId,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus({ tipo: 'idle', mensagem: '' })

    const valorNormalizado = normalizarValor(form.valor)
    if (!Number.isFinite(valorNormalizado) || valorNormalizado <= 0) {
      setStatus({ tipo: 'erro', mensagem: 'Informe um valor válido maior que zero.' })
      return
    }

    if (!form.fromAccountId || !form.toAccountId) {
      setStatus({ tipo: 'erro', mensagem: 'Selecione as contas de origem e destino.' })
      return
    }

    if (form.fromAccountId === form.toAccountId) {
      setStatus({ tipo: 'erro', mensagem: 'As contas devem ser diferentes.' })
      return
    }

    try {
      setStatus({ tipo: 'processando', mensagem: '' })
      const categoryId = form.categoryId ? Number(form.categoryId) : undefined
      const payload = {
        fromAccountId: Number(form.fromAccountId),
        toAccountId: Number(form.toAccountId),
        valor: valorNormalizado,
        descricao: form.descricao?.trim() || undefined,
        categoria: form.categoria?.trim() || (categoryId ? undefined : 'Transferência'),
        categoryId,
        data: form.data || hojeISO,
        observacao: form.observacao?.trim() || undefined,
        status: form.status,
      }

      const { data } = await api.transacoes.transferir(payload)
      setTransferencia(data?.transfer ?? null)
      setStatus({ tipo: 'sucesso', mensagem: 'Transferência registrada com sucesso!' })

      setForm((prev) => ({
        ...prev,
        valor: '',
        descricao: '',
        observacao: '',
      }))
    } catch (error) {
      const mensagem = error?.response?.data?.error ?? 'Não foi possível concluir a transferência.'
      setStatus({ tipo: 'erro', mensagem })
    }
  }

  const contasDisponiveis = useMemo(() => accounts.map((conta) => ({ id: conta.id, nome: conta.name })), [accounts])

  // Dados para o gráfico de pizza do resumo
  const chartData = useMemo(() => {
    if (!transferencia) return []
    
    const valor = transferencia.debito.valor
    return [
      { name: 'Saída', value: valor, color: '#EF4444' },
      { name: 'Entrada', value: valor, color: '#10B981' }
    ]
  }, [transferencia])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30 dark:from-slate-900 dark:via-purple-900/10 dark:to-blue-900/10">
      <div className="container mx-auto px-4 py-8 space-y-8 max-w-6xl">
        
        {/* Toast Notifications */}
        <AnimatePresence>
          {showToast && (status.tipo === 'sucesso' || status.tipo === 'erro') && (
            <div className="fixed top-4 right-4 z-50 max-w-md">
              <Toast
                tipo={status.tipo}
                mensagem={status.mensagem}
                onClose={() => {
                  setShowToast(false)
                  setStatus({ tipo: 'idle', mensagem: '' })
                }}
              />
            </div>
          )}
        </AnimatePresence>

        {/* Header Premium com Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-xl shadow-purple-500/10"
        >
          {/* Gradiente animado de fundo */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-violet-500/5 to-blue-500/5 dark:from-purple-500/10 dark:via-violet-500/10 dark:to-blue-500/10" />
          
          <div className="relative p-8">
            <div className="flex items-center gap-6">
              {/* Ícone com glow e animação */}
              <motion.div
                whileHover={{ rotate: 12, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="p-6 rounded-3xl bg-gradient-to-r from-purple-500 to-violet-600 shadow-lg shadow-purple-500/25"
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowLeftRight className="h-10 w-10 text-white" />
                </motion.div>
              </motion.div>
              
              <div className="flex-1">
                <motion.h1 
                  className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-800 to-violet-900 dark:from-white dark:via-purple-200 dark:to-violet-200 bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Transferências Internas
                </motion.h1>
                <motion.p 
                  className="text-slate-600 dark:text-slate-300 mt-2 text-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Movimente valores entre suas contas de forma segura e instantânea
                </motion.p>
                
                {/* Indicadores de status */}
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-200/30 dark:border-emerald-700/30">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                      Sistema Online
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-200/30 dark:border-blue-700/30">
                    <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Transferência Instantânea
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Formulário Principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-xl shadow-purple-500/10"
        >
          <div className="relative p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Indicador de Progresso */}
              <ProgressIndicator form={form} />

              {/* Card 1: Contas e Valor */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-2xl border border-blue-200/30 dark:border-blue-700/30 p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-blue-500/10">
                    <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Contas e Valor
                  </h3>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr_1fr]">
                  {/* Conta de Origem */}
                  <div className="relative">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Conta de origem *
                    </label>
                    <div className="relative group">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                      <select
                        name="fromAccountId"
                        value={form.fromAccountId}
                        onChange={handleChange}
                        disabled={carregandoContas}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 focus:outline-none transition-all duration-200 disabled:opacity-50"
                      >
                        <option value="">Selecione uma conta</option>
                        {contasDisponiveis.map((conta) => (
                          <option key={`from-${conta.id}`} value={conta.id}>{conta.nome}</option>
                        ))}
                      </select>
                      {carregandoContas && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          <Loader2 className="h-5 w-5 text-purple-500" />
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Botão Inverter */}
                  <div className="flex items-end justify-center">
                    <motion.button
                      type="button"
                      onClick={inverterContas}
                      className="p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg hover:shadow-xl hover:from-purple-600 hover:to-violet-700 transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Inverter contas"
                    >
                      <motion.div
                        animate={{ rotate: 180 }}
                        transition={{ duration: 0.3 }}
                        key={`${form.fromAccountId}-${form.toAccountId}`}
                      >
                        <RotateCcw className="h-6 w-6" />
                      </motion.div>
                    </motion.button>
                  </div>

                  {/* Conta de Destino */}
                  <div className="relative">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Conta de destino *
                    </label>
                    <div className="relative group">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                      <select
                        name="toAccountId"
                        value={form.toAccountId}
                        onChange={handleChange}
                        disabled={carregandoContas}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 focus:outline-none transition-all duration-200 disabled:opacity-50"
                      >
                        <option value="">Selecione uma conta</option>
                        {contasDisponiveis.map((conta) => (
                          <option key={`to-${conta.id}`} value={conta.id}>{conta.nome}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Valor */}
                  <div className="relative">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Valor da transferência *
                    </label>
                    <div className="relative group">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                      <input
                        type="text"
                        name="valor"
                        value={form.valor}
                        onChange={handleChange}
                        placeholder="0,00"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 focus:outline-none transition-all duration-200 text-lg font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Card 2: Categorias e Descrição */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-emerald-50/50 to-green-50/50 dark:from-emerald-900/10 dark:to-green-900/10 rounded-2xl border border-emerald-200/30 dark:border-emerald-700/30 p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-emerald-500/10">
                    <Tag className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Categorias e Descrição
                  </h3>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Categoria Gerenciada */}
                  <div className="relative">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Categoria gerenciada
                    </label>
                    <div className="relative group">
                      <BarChart3 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                      <select
                        name="categoryId"
                        value={form.categoryId}
                        onChange={handleChange}
                        disabled={carregandoCategorias}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200 disabled:opacity-50"
                      >
                        <option value="">Sem vínculo</option>
                        {categorias.map((categoria) => (
                          <option key={categoria.id} value={categoria.id}>{categoria.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Categoria Texto */}
                  <div className="relative">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Categoria (texto)
                    </label>
                    <div className="relative group">
                      <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                      <input
                        type="text"
                        name="categoria"
                        value={form.categoria}
                        onChange={handleChange}
                        list="categorias-transferencias"
                        maxLength={80}
                        placeholder="Transferência"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200"
                      />
                      <datalist id="categorias-transferencias">
                        {categoriasDisponiveis.map((categoria) => (
                          <option key={categoria} value={categoria} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  {/* Descrição */}
                  <div className="relative">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Descrição opcional
                    </label>
                    <div className="relative group">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                      <input
                        type="text"
                        name="descricao"
                        value={form.descricao}
                        onChange={handleChange}
                        maxLength={180}
                        placeholder="Ex.: Reserva de emergência"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Card 3: Data, Status e Observações */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-2xl border border-amber-200/30 dark:border-amber-700/30 p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-amber-500/10">
                    <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Data e Observações
                  </h3>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="grid gap-6 sm:grid-cols-2">
                    {/* Data */}
                    <div className="relative">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Data da transferência *
                      </label>
                      <div className="relative group">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                        <input
                          type="date"
                          name="data"
                          value={form.data}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 focus:outline-none transition-all duration-200"
                        />
                      </div>
                    </div>

                    {/* Status */}
                    <div className="relative">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Status
                      </label>
                      <div className="relative group">
                        <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                        <select
                          name="status"
                          value={form.status}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 focus:outline-none transition-all duration-200"
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Observação */}
                  <div className="relative">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Observações adicionais
                    </label>
                    <div className="relative group">
                      <MessageSquare className="absolute left-3 top-4 h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                      <textarea
                        name="observacao"
                        value={form.observacao}
                        onChange={handleChange}
                        maxLength={500}
                        rows={4}
                        placeholder="Observações sobre a transferência..."
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 focus:outline-none transition-all duration-200 resize-none"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Botão de Submissão Premium */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex justify-center pt-4"
              >
                <motion.button
                  type="submit"
                  disabled={status.tipo === 'processando'}
                  className="relative overflow-hidden px-12 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold text-lg shadow-xl hover:shadow-2xl disabled:shadow-none transition-all duration-300"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Brilho animado */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  
                  <div className="relative flex items-center gap-3">
                    {status.tipo === 'processando' ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Loader2 className="h-6 w-6" />
                        </motion.div>
                        Processando...
                      </>
                    ) : (
                      <>
                        <motion.div
                          animate={{ 
                            scale: [1, 1.2, 1],
                            rotate: [0, 180, 360] 
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <Sparkles className="h-6 w-6" />
                        </motion.div>
                        Registrar Transferência
                      </>
                    )}
                  </div>
                </motion.button>
              </motion.div>
            </form>
          </div>
        </motion.div>

        {/* Resumo da Transferência com Gráfico */}
        <AnimatePresence>
          {transferencia && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-xl shadow-purple-500/10"
            >
              <div className="relative p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      Transferência Realizada
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300">
                      Operação concluída com sucesso
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                  {/* Cards de Saída e Entrada */}
                  <div className="space-y-4">
                    {/* Saída */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="rounded-2xl border border-red-200/50 dark:border-red-700/50 bg-gradient-to-r from-red-50/50 to-rose-50/50 dark:from-red-900/10 dark:to-rose-900/10 p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-2xl bg-red-500/10">
                            <ArrowDownRight className="h-8 w-8 text-red-500" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-red-700 dark:text-red-300 mb-1">
                              Saída
                            </h3>
                            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                              {transferencia.debito.descricao}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Wallet className="h-4 w-4 text-slate-500" />
                              <span className="text-sm text-slate-600 dark:text-slate-300">
                                {transferencia.debito.account?.name}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {formatarDataISOParaBR(transferencia.debito.data)} • {transferencia.debito.categoria}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                            -{formatarMoedaBRL(transferencia.debito.valor)}
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Entrada */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50 bg-gradient-to-r from-emerald-50/50 to-green-50/50 dark:from-emerald-900/10 dark:to-green-900/10 p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-2xl bg-emerald-500/10">
                            <ArrowUpRight className="h-8 w-8 text-emerald-500" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mb-1">
                              Entrada
                            </h3>
                            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                              {transferencia.credito.descricao}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Wallet className="h-4 w-4 text-slate-500" />
                              <span className="text-sm text-slate-600 dark:text-slate-300">
                                {transferencia.credito.account?.name}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {formatarDataISOParaBR(transferencia.credito.data)} • {transferencia.credito.categoria}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            +{formatarMoedaBRL(transferencia.credito.valor)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Mini Gráfico */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-600/50 p-6"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <PieChart className="h-5 w-5 text-purple-500" />
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        Visão Geral
                      </h3>
                    </div>
                    
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <span className="text-sm text-slate-600 dark:text-slate-300">Saída</span>
                        </div>
                        <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                          {formatarMoedaBRL(transferencia.debito.valor)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-emerald-500" />
                          <span className="text-sm text-slate-600 dark:text-slate-300">Entrada</span>
                        </div>
                        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatarMoedaBRL(transferencia.credito.valor)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
      </div>
    </div>
  )
}
