// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  PiggyBank,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  PlusCircle,
  Target,
  BarChart3,
  BookOpen,
  Wallet,
  Clock,
  CreditCard,
  ShieldAlert,
  Settings,
  Sparkles,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Label,
  LineChart,
  Line,
} from 'recharts'
import api from '../services/api'

/* ============================================================================
   HELPERS
============================================================================ */
const formatMoney = (value) => {
  const numeric = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numeric)) return '--'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numeric)
}

const resolveTrend = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return null
  if (value === 0) return { direction: 'up', label: '0,0' }
  return {
    direction: value > 0 ? 'up' : 'down',
    label: Math.abs(value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }),
  }
}

const tooltipCurrency = (value) => [formatMoney(value ?? 0), '']

const formatDate = (value) => {
  if (!value) return '--'
  const input = typeof value === 'string' && value.length === 10 ? `${value}T00:00:00` : value
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

/* ============================================================================
   UI BASICS
============================================================================ */
function SectionCard({ title, right, className = '', children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`group rounded-2xl border border-white/70 bg-white/90 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:border-white/10 dark:bg-zinc-900/80 dark:shadow-2xl ${className}`}
    >
      <header className="flex items-center justify-between border-b border-zinc-200/70 px-4 py-3 dark:border-white/10">
        <h3 className="text-base font-semibold text-zinc-900 transition-colors group-hover:text-zinc-700 dark:text-zinc-100 dark:group-hover:text-zinc-50">
          {title}
        </h3>
        {right}
      </header>
      <div className="p-4">{children}</div>
    </motion.section>
  )
}

function BadgeIcon({ children, className = '' }) {
  return (
    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${className}`}>
      {children}
    </div>
  )
}

function KpiCard({ title, value, trend = 'up', trendValue = '', icon: Icon, tone = 'violet' }) {
  const scheme = useMemo(
    () => ({
      violet: {
        bg: 'bg-white dark:bg-zinc-900/70',
        border: 'border-zinc-200 dark:border-white/10',
        chipBg: 'bg-zinc-900/5 dark:bg-white/10',
        chipFg: 'text-zinc-700 dark:text-white/80',
        iconBg: 'bg-zinc-900 dark:bg-white/10',
      },
      blue: {
        bg: 'bg-white dark:bg-zinc-900/70',
        border: 'border-sky-100 dark:border-sky-500/30',
        chipBg: 'bg-sky-500/10 dark:bg-sky-500/20',
        chipFg: 'text-sky-700 dark:text-sky-200',
        iconBg: 'bg-gradient-to-br from-sky-500 to-blue-600',
      },
      purple: {
        bg: 'bg-white dark:bg-zinc-900/70',
        border: 'border-rose-100 dark:border-rose-500/30',
        chipBg: 'bg-rose-500/10 dark:bg-rose-500/20',
        chipFg: 'text-rose-700 dark:text-rose-200',
        iconBg: 'bg-gradient-to-br from-rose-500 to-amber-500',
      },
      indigo: {
        bg: 'bg-white dark:bg-zinc-900/70',
        border: 'border-emerald-100 dark:border-emerald-500/30',
        chipBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        chipFg: 'text-emerald-700 dark:text-emerald-200',
        iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      },
    })[tone],
    [tone]
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`group rounded-2xl border ${scheme.border} ${scheme.bg} p-4 shadow-lg transition-all duration-300 hover:shadow-xl dark:shadow-2xl min-h-[120px]`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 5, scale: 1.1 }}
            className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-lg ${scheme.iconBg}`}
          >
            <Icon className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-white/60">
              {title}
            </p>
            <p className="leading-none text-xl font-bold text-zinc-900 dark:text-white">
              {value}
            </p>
          </div>
        </div>
        {trendValue ? (
          <motion.span
            whileHover={{ scale: 1.05 }}
            className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium shadow-sm ${scheme.chipBg} ${scheme.chipFg}`}
          >
            {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trendValue}
          </motion.span>
        ) : null}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: trend === 'up' ? '75%' : '50%' }}
            transition={{ duration: 1, delay: 0.5 }}
            className={`h-1.5 rounded-full ${
              trend === 'up' ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-orange-400 to-amber-500'
            }`}
          />
        </div>
        <p className="whitespace-nowrap text-xs text-zinc-500 dark:text-white/60">vs mês anterior</p>
      </div>
    </motion.div>
  )
}

function TransactionRow({ transaction: t }) {
  const receita = t.tipo === 'receita'
  const detalhes = [formatDate(t.data), t.categoria, t.account?.name].filter(Boolean).join(' • ')
  return (
    <div className="group flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            receita
              ? 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400'
              : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
          }`}
        >
          {receita ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t.descricao}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{detalhes || 'Sem detalhes'}</p>
        </div>
      </div>
      <div
        className={`text-sm font-semibold ${
          receita ? 'text-violet-600 dark:text-violet-400' : 'text-purple-600 dark:text-purple-400'
        }`}
      >
        {receita ? '+' : '-'} {formatMoney(t.valor)}
      </div>
    </div>
  )
}

function QuickActionCard({
  title,
  desc,
  icon: Icon,
  onClick,
  color = 'text-white/60',
  hover = 'group-hover:text-emerald-400',
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group rounded-2xl border border-white/20 bg-white/10 p-5 text-left shadow-lg backdrop-blur-xl transition-all hover:bg-white/20 hover:shadow-xl"
      aria-label={title}
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-white transition-colors">{title}</h4>
          <p className="mt-1 text-sm text-white/70">{desc}</p>
        </div>
        <Icon className={`h-6 w-6 transition-colors ${color} ${hover}`} />
      </div>
    </motion.button>
  )
}

/* ============================================================================
   NOVOS COMPONENTES
============================================================================ */
function PeriodPanel({ periodo, onChange }) {
  const periodos = [
    { label: 'Últimos 3 meses', value: '3meses' },
    { label: 'Últimos 6 meses', value: '6meses' },
    { label: 'Último ano', value: '1ano' },
  ]

  const [aberto, setAberto] = React.useState(false)
  
  const labelAbreviado = {
    '3meses': '3 meses',
    '6meses': '6 meses',
    '1ano': '1 ano'
  }

  const periodAtivo = periodos.find(p => p.value === periodo)

  return (
    <div className="relative">
      <button
        onClick={() => setAberto(!aberto)}
        className="group rounded-2xl border border-blue-100 dark:border-blue-500/30 bg-white dark:bg-zinc-900/70 p-4 shadow-lg transition-all duration-300 hover:shadow-xl dark:shadow-2xl min-h-[120px] w-full text-left hover:scale-[1.02] hover:-translate-y-1"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-white/60">
                Período
              </p>
              <p className="leading-none text-xl font-bold text-zinc-900 dark:text-white whitespace-nowrap">
                {labelAbreviado[periodo]}
              </p>
            </div>
          </div>
          <svg className={`w-5 h-5 text-blue-600 dark:text-blue-400 transition-transform ${aberto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </button>

      {aberto && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setAberto(false)} />
          <div className="absolute top-full mt-2 right-0 z-50 bg-white dark:bg-zinc-900 border border-blue-100 dark:border-blue-500/30 rounded-xl shadow-xl overflow-hidden min-w-[200px]">
            {periodos.map((item) => {
              const ativo = periodo === item.value
              return (
                <button
                  key={item.value}
                  onClick={() => {
                    onChange(item.value)
                    setAberto(false)
                  }}
                  className={`w-full px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${
                    ativo
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function FinancialInsightsCard({ insights, carregando }) {
  return (
    <SectionCard title="Insights Financeiros" className="h-full">
      {carregando ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Gerando insights...</p>
      ) : insights.length ? (
        <div className="space-y-2">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`rounded-xl border p-3 ${
                insight.tone === 'amber'
                  ? 'border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-950/20'
                  : insight.tone === 'emerald'
                  ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/30 dark:bg-emerald-950/20'
                  : 'border-violet-200 bg-violet-50 dark:border-violet-900/30 dark:bg-violet-950/20'
              }`}
            >
              <h4 className="mb-1 text-xs font-semibold text-zinc-900 dark:text-zinc-100">{insight.title}</h4>
              <p className="mb-1 text-xs leading-tight text-zinc-600 dark:text-zinc-400">{insight.description}</p>
              {insight.highlight ? (
                <span className="inline-flex rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-white/10 dark:text-zinc-200">
                  {insight.highlight}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Nenhum insight disponível ainda.</p>
      )}
    </SectionCard>
  )
}

function WeatherFinanceCard({ saldo, trend, carregando }) {
  const direction = trend?.direction ?? 'up'
  const label = trend?.label ?? '0,0'
  const mood = direction === 'down' ? '🌥️' : '☀️'
  const titulo = direction === 'down' ? 'Atenção' : 'Ensolarado'
  const mensagem = direction === 'down'
    ? 'Despesas cresceram em relação ao período anterior. Reveja seus gastos essenciais.'
    : 'Situação saudável — mantenha seus hábitos positivos.'

  return (
    <SectionCard title="Clima Financeiro" className="relative h-full overflow-hidden">
      <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 opacity-20" />
      <div className="relative space-y-3">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{mood}</div>
          <div>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">{carregando ? '---' : titulo}</p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {carregando ? 'Calculando variáveis...' : mensagem}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-zinc-500 dark:text-zinc-400">Saldo atual</p>
            <p className="font-medium text-violet-600 dark:text-violet-400">{carregando ? '--' : formatMoney(saldo)}</p>
          </div>
          <div>
            <p className="text-zinc-500 dark:text-zinc-400">Tendência</p>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">{carregando ? '--' : `${direction === 'down' ? '-' : '+'}${label}%`}</p>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}

function GoalCard({ goal, carregando, onManageGoal = () => {} }) {
  if (carregando) {
    return (
      <SectionCard title="Progresso da Meta" className="h-full">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Buscando metas ativas...</p>
      </SectionCard>
    )
  }

  if (!goal) {
    return (
      <SectionCard title="Progresso da Meta" className="h-full">
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
          <p>Você ainda não possui metas ativas.</p>
          <button
            onClick={onManageGoal}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg transition hover:bg-violet-700"
          >
            <Target className="h-4 w-4" /> Criar meta
          </button>
        </div>
      </SectionCard>
    )
  }

  const percent = goal.targetAmount ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0
  const data = [
    { name: 'meta', value: percent },
    { name: 'faltando', value: 100 - percent },
  ]

  return (
    <SectionCard title="Progresso da Meta" className="h-full">
      <div className="flex items-center gap-6">
        <div className="h-[140px] w-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius={50} outerRadius={65} startAngle={90} endAngle={-270}>
                <Cell key="meta" fill="#16a34a" />
                <Cell key="faltando" fill="#e5e7eb" />
                <Label value={`${percent}%`} position="center" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400">{goal.title}</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Progresso: {formatMoney(goal.currentAmount)} de {formatMoney(goal.targetAmount)}
          </p>
          {goal.dueDate ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Prazo: {formatDate(goal.dueDate)}</p>
          ) : null}
          <button
            onClick={onManageGoal}
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
          >
            <Target className="h-4 w-4" /> Ajustar metas
          </button>
        </div>
      </div>
    </SectionCard>
  )
}

function InvestmentCard({ evolucaoSaldo, carregando }) {
  const saldoAtual = evolucaoSaldo.length ? evolucaoSaldo[evolucaoSaldo.length - 1].saldo : null
  const saldoInicial = evolucaoSaldo.length ? evolucaoSaldo[0].saldo : null
  const variacao = saldoAtual !== null && saldoInicial !== null ? saldoAtual - saldoInicial : null

  return (
    <SectionCard
      title="Performance do Patrimônio"
      right={
        variacao !== null && !carregando ? (
          <span className={`text-sm font-medium ${variacao >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {variacao >= 0 ? '+' : ''}{formatMoney(variacao)}
          </span>
        ) : null
      }
      className="h-full"
    >
      {carregando ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Calculando evolução...</p>
      ) : (
        <div className="space-y-3">
          <div className="rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 p-4 text-center dark:from-violet-950/20 dark:to-purple-950/20">
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Saldo acumulado</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{formatMoney(saldoAtual)}</p>
            <p className="text-[11px] text-violet-600 dark:text-violet-400">Comparado ao início do período</p>
          </div>
          <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
            <p>
              Início do período: <strong className="text-zinc-800 dark:text-zinc-200">{formatMoney(saldoInicial)}</strong>
            </p>
            {variacao !== null ? (
              <p>
                Diferença acumulada: <strong className={`${variacao >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{formatMoney(variacao)}</strong>
              </p>
            ) : null}
          </div>
        </div>
      )}
    </SectionCard>
  )
}

function AccountsCard({ contas, carregando }) {
  return (
    <SectionCard title="Saldo por Conta" className="h-full">
      {carregando ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Carregando contas...</p>
      ) : contas.length ? (
        <ul className="space-y-3">
          {contas.map((conta) => (
            <li key={conta.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BadgeIcon className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  <CreditCard className="h-5 w-5" />
                </BadgeIcon>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">{conta.name}</span>
              </div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{formatMoney(conta.balance)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Nenhuma conta ativa encontrada.</p>
      )}
    </SectionCard>
  )
}

function AlertsCard({ alerts, carregando }) {
  return (
    <SectionCard title="Alertas" right={<ShieldAlert className="h-5 w-5 text-amber-500" aria-hidden="true" />} className="h-full">
      {carregando ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Avaliando riscos...</p>
      ) : alerts.length ? (
        <ul className="space-y-2">
          {alerts.map((alerta, index) => (
            <li
              key={index}
              className={`rounded-lg border px-3 py-2 text-xs ${
                alerta.tone === 'emerald'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-900/20 dark:text-emerald-200'
                  : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/30 dark:bg-amber-900/20 dark:text-amber-200'
              }`}
            >
              {alerta.message}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Nenhum alerta relevante neste período.</p>
      )}
    </SectionCard>
  )
}

function LineChartCard({ data, carregando }) {
  return (
    <SectionCard title="Receita x Despesa (Linha)" className="h-full">
      <div className="h-[240px]">
        {carregando ? (
          <div className="flex h-full items-center justify-center text-xs text-zinc-500 dark:text-zinc-400">Gerando série...</div>
        ) : data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="mes" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip formatter={tooltipCurrency} labelFormatter={(label) => `Mês: ${label}`} />
              <Line type="monotone" dataKey="receitas" stroke="#16a34a" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="despesas" stroke="#dc2626" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-zinc-500 dark:text-zinc-400">
            Sem movimentações suficientes.
          </div>
        )}
      </div>
    </SectionCard>
  )
}

/* ============================================================================
   PÁGINA
============================================================================ */
export default function Dashboard() {
  const navigate = useNavigate()
  const [periodo, setPeriodo] = useState('6meses')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [dados, setDados] = useState({
    totals: null,
    receitasVsDespesas: [],
    evolucaoSaldo: [],
    categorias: [],
    contas: [],
    transacoesRecentes: [],
    goalResumo: null,
  })

  useEffect(() => {
    let ativo = true

    async function carregarDashboard() {
      setCarregando(true)
      setErro('')
      try {
        const resposta = await api.dashboard.overview(periodo)
        if (!ativo) return
        setDados(resposta.data)
      } catch (e) {
        if (!ativo) return
        setErro(e.response?.data?.error || 'Não foi possível carregar o dashboard.')
        setDados({
          totals: null,
          receitasVsDespesas: [],
          evolucaoSaldo: [],
          categorias: [],
          contas: [],
          transacoesRecentes: [],
          goalResumo: null,
        })
      } finally {
        if (ativo) setCarregando(false)
      }
    }

    carregarDashboard()
    return () => {
      ativo = false
    }
  }, [periodo])

  const totais = dados.totals
  const totalReceitas = totais?.receitas?.valor ?? null
  const totalDespesas = totais?.despesas?.valor ?? null
  const saldoTotal = totais?.saldo?.valor ?? null
  const economia = saldoTotal ?? (totalReceitas !== null && totalDespesas !== null ? totalReceitas - totalDespesas : null)

  const trendReceitas = resolveTrend(totais?.receitas?.variacaoPercentual) ?? { direction: 'up', label: '0,0' }
  const trendDespesas = resolveTrend(totais?.despesas?.variacaoPercentual) ?? { direction: 'up', label: '0,0' }
  const trendSaldo = resolveTrend(totais?.saldo?.variacaoPercentual) ?? { direction: 'up', label: '0,0' }

  const receitasVsDespesas = dados.receitasVsDespesas ?? []
  const categorias = dados.categorias ?? []
  const evolucaoSaldo = dados.evolucaoSaldo ?? []
  const contas = dados.contas ?? []
  const transacoesRecentes = dados.transacoesRecentes ?? []
  const goalResumo = dados.goalResumo

  const totalCategorias = useMemo(
    () => categorias.reduce((acc, categoria) => acc + (categoria.value || 0), 0),
    [categorias]
  )

  const insights = useMemo(() => {
    const lista = []
    if (trendReceitas.label && totalReceitas !== null) {
      lista.push({
        title: '💡 Receitas',
        description: `Receitas no período somam ${formatMoney(totalReceitas)} com variação de ${trendReceitas.label}% versus janela anterior.`,
        tone: trendReceitas.direction === 'down' ? 'amber' : 'emerald',
        highlight: trendReceitas.direction === 'down' ? 'Atenção para novas fontes de renda' : 'Mantenha a consistência',
      })
    }

    if (categorias[0]) {
      lista.push({
        title: '📊 Categoria em destaque',
        description: `${categorias[0].name} representa ${categorias[0].percentage ?? 0}% das despesas do período.`,
        tone: categorias[0].percentage >= 40 ? 'amber' : 'violet',
        highlight: formatMoney(categorias[0].value),
      })
    }

    if (economia !== null) {
      lista.push({
        title: '🎯 Economia acumulada',
        description: `O saldo do período é ${formatMoney(economia)}. Considere direcionar parte disso para suas metas.`,
        tone: economia >= 0 ? 'emerald' : 'amber',
        highlight: economia >= 0 ? 'Bom resultado' : 'Reduza despesas',
      })
    }

    return lista.slice(0, 3)
  }, [trendReceitas, totalReceitas, categorias, economia])

  const alerts = useMemo(() => {
    const lista = []
    if (totalReceitas !== null && totalDespesas !== null && totalDespesas > totalReceitas) {
      lista.push({
        tone: 'amber',
        message: 'As despesas superaram as receitas no período selecionado. Reveja seus gastos prioritários.',
      })
    }
    if (categorias[0] && categorias[0].percentage >= 45) {
      lista.push({
        tone: 'amber',
        message: `${categorias[0].name} concentra ${categorias[0].percentage}% das despesas. Avalie ajustes.`,
      })
    }
    if (!contas.length) {
      lista.push({
        tone: 'emerald',
        message: 'Cadastre uma conta financeira para acompanhar o saldo consolidado no dashboard.',
      })
    }
    return lista
  }, [totalReceitas, totalDespesas, categorias, contas])

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100 transition-colors duration-300 ease-out dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Fundo premium */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0" />
        <div className="absolute -top-40 -left-40 h-96 w-96 animate-pulse rounded-full bg-gradient-to-r from-white/60 to-slate-200/50 blur-3xl dark:from-slate-900/50 dark:to-slate-800/40" />
        <div
          className="absolute -bottom-40 -right-40 h-80 w-80 animate-pulse rounded-full bg-gradient-to-r from-white/40 to-slate-300/40 blur-3xl dark:from-slate-900/40 dark:to-slate-800/30"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute left-1/4 top-1/3 h-64 w-64 animate-pulse rounded-full bg-gradient-to-r from-white/30 to-slate-200/30 blur-2xl dark:from-slate-900/30 dark:to-slate-800/30"
          style={{ animationDelay: '4s' }}
        />
        <div
          className="absolute right-1/4 bottom-1/4 h-80 w-80 animate-pulse rounded-full bg-gradient-to-r from-white/20 to-slate-300/20 blur-3xl dark:from-slate-900/20 dark:to-slate-800/20"
          style={{ animationDelay: '6s' }}
        />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-20 w-full border-b border-slate-200/60 bg-white/90 backdrop-blur-xl shadow-sm transition-colors duration-300 dark:border-slate-800/60 dark:bg-slate-900/85 dark:shadow-slate-950/40"
      >
        <div className="mx-auto flex max-w-[1440px] 2xl:max-w-[1600px] items-center justify-between px-6 py-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-white via-blue-50/60 to-blue-100/60 shadow-[0_12px_35px_-20px_rgba(37,99,235,0.55)] ring-1 ring-blue-100 transition-colors duration-300 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700/80 dark:ring-slate-600 dark:shadow-[0_12px_30px_-18px_rgba(15,23,42,0.8)]">
              <PiggyBank className="h-6 w-6 text-slate-700 dark:text-slate-200" />
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500 dark:text-amber-400" />
              <div>
                <h1 className="text-xl font-bold text-slate-900 md:text-2xl dark:text-slate-100">
                  Dashboard Financeiro
                </h1>
                <p className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"></span>
                  Bem-vindo de volta! Suas finanças estão sendo monitoradas.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/transacoes')}
              className="group inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all duration-200 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/30 dark:bg-slate-100 dark:text-slate-900 dark:shadow-slate-100/20 dark:hover:bg-slate-200 dark:hover:shadow-slate-100/40"
            >
              <PlusCircle className="h-4 w-4 transition-transform group-hover:rotate-90" />
              Nova Transação
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/configuracoes')}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              <Settings className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              Configurações
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Conteúdo */}
      <div className="mx-auto max-w-[1440px] 2xl:max-w-[1600px] px-6 pb-6 lg:px-8">
        {erro && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50/90 p-4 text-sm text-red-700 shadow-sm dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            {erro}
          </div>
        )}

        {/* SEÇÃO PRINCIPAL - Cards KPI e Filtros na mesma linha, colados no topo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-8 grid grid-cols-12 gap-6 pt-6"
        >
          {/* KPIs principais ocupando mais espaço */}
          <div className="col-span-12 lg:col-span-9 xl:col-span-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
            >
              <KpiCard
                title="Saldo Total"
                value={formatMoney(saldoTotal)}
                trend={trendSaldo.direction}
                trendValue={`${trendSaldo.label}%`}
                icon={Wallet}
                tone="violet"
              />
              <KpiCard
                title="Receitas do Período"
                value={formatMoney(totalReceitas)}
                trend={trendReceitas.direction}
                trendValue={`${trendReceitas.label}%`}
                icon={TrendingUp}
                tone="blue"
              />
              <KpiCard
                title="Despesas do Período"
                value={formatMoney(totalDespesas)}
                trend={trendDespesas.direction}
                trendValue={`${trendDespesas.label}%`}
                icon={TrendingDown}
                tone="purple"
              />
              <KpiCard
                title="Economia"
                value={formatMoney(economia)}
                trend={trendSaldo.direction}
                trendValue={`${trendSaldo.label}%`}
                icon={PiggyBank}
                tone="indigo"
              />
            </motion.div>
          </div>

          {/* Filtros compactos à direita */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="col-span-12 lg:col-span-3 xl:col-span-2"
          >
            <PeriodPanel periodo={periodo} onChange={setPeriodo} />
          </motion.div>
        </motion.div>

        {/* SEGUNDA SEÇÃO - Cards auxiliares logo abaixo com espaçamento harmonioso */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <WeatherFinanceCard saldo={saldoTotal} trend={trendSaldo} carregando={carregando} />
          <FinancialInsightsCard insights={insights} carregando={carregando} />
          <GoalCard goal={goalResumo} carregando={carregando} onManageGoal={() => navigate('/metas')} />
          <InvestmentCard evolucaoSaldo={evolucaoSaldo} carregando={carregando} />
        </motion.section>

        {/* TERCEIRA SEÇÃO - Gráficos compactos */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch"
        >
          <SectionCard title="Receitas vs Despesas" className="h-full">
            <div className="h-[240px]">
              {carregando ? (
                <div className="flex h-full items-center justify-center text-xs text-zinc-500 dark:text-zinc-400">Carregando séries...</div>
              ) : receitasVsDespesas.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={receitasVsDespesas}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="mes" stroke="#ffffff80" />
                    <YAxis stroke="#ffffff80" />
                    <Tooltip formatter={tooltipCurrency} labelFormatter={(l) => `Mês: ${l}`} />
                    <Bar dataKey="receitas" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="despesas" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-zinc-500 dark:text-zinc-400">
                  Sem movimentações registradas neste período.
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Gastos por Categoria" className="h-full">
            <div className="h-[240px]">
              {carregando ? (
                <div className="flex h-full items-center justify-center text-xs text-zinc-500 dark:text-zinc-400">Mapeando categorias...</div>
              ) : categorias.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categorias} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" paddingAngle={2}>
                      {categorias.map((categoria, index) => (
                        <Cell key={index} fill={categoria.color} />
                      ))}
                      <Label value={formatMoney(totalCategorias)} position="center" className="text-white font-bold" />
                    </Pie>
                    <Tooltip formatter={tooltipCurrency} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-zinc-500 dark:text-zinc-400">
                  Cadastre despesas para ver a distribuição por categoria.
                </div>
              )}
            </div>
          </SectionCard>

          <LineChartCard data={receitasVsDespesas} carregando={carregando} />
        </motion.div>

        {/* QUARTA SEÇÃO - Transações / Contas / Alertas */}
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <SectionCard
            title="Transações Recentes"
            className="h-full"
            right={
              <button onClick={() => navigate('/transacoes')} className="rounded-lg px-3 py-1.5 text-sm text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
                Ver todas
              </button>
            }
          >
            {carregando ? (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Carregando transações...</p>
            ) : transacoesRecentes.length ? (
              <div className="max-h-[200px] divide-y divide-zinc-200/60 overflow-y-auto dark:divide-white/10">
                {transacoesRecentes.map((t) => (
                  <TransactionRow key={t.id} transaction={t} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Nenhuma transação confirmada encontrada.</p>
            )}
          </SectionCard>
          <AccountsCard contas={contas} carregando={carregando} />
          <AlertsCard alerts={alerts} carregando={carregando} />
        </div>

        {/* QUINTA SEÇÃO - Ações rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.8 }}
          className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5"
        >
          <QuickActionCard title="Transações" desc="Gerencie receitas e despesas" icon={ExternalLink} onClick={() => navigate('/transacoes')} color="text-emerald-400" hover="group-hover:text-emerald-300" />
          <QuickActionCard title="Metas" desc="Acompanhe seus objetivos" icon={Target} onClick={() => navigate('/metas')} color="text-blue-400" hover="group-hover:text-blue-300" />
          <QuickActionCard title="Relatórios" desc="Análise financeira detalhada" icon={BarChart3} onClick={() => navigate('/relatorios')} color="text-violet-400" hover="group-hover:text-violet-300" />
          <QuickActionCard title="Educação" desc="Aprenda sobre finanças" icon={BookOpen} onClick={() => navigate('/educacao')} color="text-amber-400" hover="group-hover:text-amber-300" />
          <QuickActionCard title="Cadastrar Conta" desc="Adicione bancos e carteiras" icon={CreditCard} onClick={() => navigate('/configuracoes')} color="text-sky-400" hover="group-hover:text-sky-300" />
        </motion.div>

        {/* SEXTA SEÇÃO - Insights e Recomendações (compacto) */}
        <div className="mb-6 relative">
          <div className="group relative overflow-hidden rounded-2xl border border-purple-200/60 bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 p-6 shadow-xl transition-all duration-300 hover:shadow-2xl dark:from-purple-900/20 dark:via-violet-900/20 dark:to-indigo-900/20 dark:border-purple-800/30">
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br from-purple-400/20 to-violet-500/20 blur-2xl transition-all duration-700 group-hover:scale-125"></div>
            <div className="relative">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">💡 Insight Financeiro</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">Baseado na sua performance mensal</p>
                </div>
              </div>
              <div className="mb-3 rounded-xl bg-white/60 p-3 backdrop-blur dark:bg-zinc-800/60">
                <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                  🎉 <strong>Resumo:</strong> Seu saldo no período é <span className="font-bold text-purple-600 dark:text-purple-400">{formatMoney(economia)}</span> — variação de <strong>{trendSaldo.label}%</strong> em relação à janela anterior.
                </p>
                <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                  💰 <strong>Recomendação:</strong> Avalie direcionar 70% desse valor ({formatMoney((economia || 0) * 0.7)}) para metas ou reserva e 30% ({formatMoney((economia || 0) * 0.3)}) para oportunidades de investimento de baixo risco.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => navigate('/metas')} className="group/btn inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-purple-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/40 active:scale-95">
                  <Target className="h-4 w-4 transition-transform group-hover/btn:rotate-12" />
                  Definir Novas Metas
                </button>
                <button onClick={() => navigate('/educacao')} className="inline-flex items-center gap-2 rounded-lg border-2 border-purple-300/60 bg-white/80 px-3 py-2 text-xs font-semibold text-purple-700 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-400 hover:bg-purple-50 dark:border-purple-600/40 dark:bg-zinc-800/80 dark:text-purple-300 dark:hover:bg-purple-900/20">
                  <BookOpen className="h-4 w-4" />
                  Educação Financeira
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="pt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
          © 2025 MoneyMapp. Todos os direitos reservados.
        </div>
      </div>
    </div>
  )
}
