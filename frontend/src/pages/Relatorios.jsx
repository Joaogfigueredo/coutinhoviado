import React, { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Download,
  PiggyBank,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import api from '../services/api'

function StatCard({ title, value, subtitle, icon: Icon, trendDirection, trendLabel, color = 'blue' }) {
  const colorClasses = {
    blue: 'from-indigo-500 to-sky-400',
    green: 'from-emerald-500 to-teal-400',
    red: 'from-red-500 to-pink-400',
    purple: 'from-purple-500 to-violet-400',
  }

  return (
    <div className="group rounded-2xl border border-zinc-200/60 bg-white/70 p-6 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-zinc-900/70">
      <div className="flex items-center justify-between">
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{title}</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{subtitle}</p>}
        </div>
        <div className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${colorClasses[color]} shadow-lg transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="h-7 w-7 text-white" />
        </div>
      </div>

      {trendDirection && trendLabel && (
        <div className="mt-4 flex items-center border-t border-zinc-200/60 pt-4 dark:border-white/10">
          {trendDirection === 'up' ? (
            <ArrowUpRight className="mr-2 h-4 w-4 text-emerald-500" />
          ) : (
            <ArrowDownRight className="mr-2 h-4 w-4 text-red-500" />
          )}
          <span className={`text-sm font-semibold ${trendDirection === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {trendLabel}%
          </span>
          <span className="ml-2 text-sm text-zinc-500 dark:text-zinc-400">vs periodo anterior</span>
        </div>
      )}
    </div>
  )
}

const formatMoney = (value) => {
  if (value === null || value === undefined) return '--'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

const resolveTrend = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return null
  if (value === 0) return { direction: 'up', label: '0,0' }
  return {
    direction: value > 0 ? 'up' : 'down',
    label: Math.abs(value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }),
  }
}

export default function Relatorios() {
  const [periodo, setPeriodo] = useState('6meses')
  const [exportando, setExportando] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [totais, setTotais] = useState(null)
  const [seriesMensais, setSeriesMensais] = useState({ receitasVsDespesas: [], evolucaoSaldo: [] })
  const [categorias, setCategorias] = useState([])

  useEffect(() => {
    let ativo = true

    async function carregarDados() {
      setCarregando(true)
      setErro('')
      try {
        const [totaisRes, mensalRes, categoriasRes] = await Promise.all([
          api.relatorios.totais(periodo),
          api.relatorios.mensal(periodo),
          api.relatorios.categorias(periodo),
        ])

        if (!ativo) return

        setTotais(totaisRes.data?.totals ?? null)
        setSeriesMensais({
          receitasVsDespesas: mensalRes.data?.receitasVsDespesas ?? [],
          evolucaoSaldo: mensalRes.data?.evolucaoSaldo ?? [],
        })
        setCategorias(categoriasRes.data?.categorias ?? [])
      } catch (e) {
        if (!ativo) return
        setErro(e.response?.data?.error || 'Nao foi possivel carregar os relatorios.')
        setTotais(null)
        setSeriesMensais({ receitasVsDespesas: [], evolucaoSaldo: [] })
        setCategorias([])
      } finally {
        if (ativo) setCarregando(false)
      }
    }

    carregarDados()
    return () => {
      ativo = false
    }
  }, [periodo])

  const totalReceitas = totais?.receitas?.valor ?? null
  const totalDespesas = totais?.despesas?.valor ?? null
  const saldoTotal = totais?.saldo?.valor ?? null

  const trendReceitas = resolveTrend(totais?.receitas?.variacaoPercentual)
  const trendDespesas = resolveTrend(totais?.despesas?.variacaoPercentual)
  const trendSaldo = resolveTrend(totais?.saldo?.variacaoPercentual)

  const receitasVsDespesas = seriesMensais.receitasVsDespesas
  const evolucaoSaldo = seriesMensais.evolucaoSaldo

  const possuiSerieFinanceira = useMemo(
    () => receitasVsDespesas.some((item) => (item.receitas || 0) !== 0 || (item.despesas || 0) !== 0),
    [receitasVsDespesas]
  )

  const possuiSerieSaldo = useMemo(
    () => evolucaoSaldo.some((item) => (item.saldo || 0) !== 0),
    [evolucaoSaldo]
  )

  const handleExportarCsv = () => {
    if (receitasVsDespesas.length === 0) return
    try {
      setExportando(true)
      const headers = ['Mes', 'Receitas', 'Despesas', 'Saldo']
      const linhas = receitasVsDespesas.map((item) => {
        const saldo = (item.receitas || 0) - (item.despesas || 0)
        const rotulo = item.ano ? `${item.mes}/${item.ano}` : item.mes
        return [rotulo, item.receitas || 0, item.despesas || 0, saldo]
      })

      const csv = [headers, ...linhas]
        .map((linha) => linha.map((valor) => `"${valor}"`).join(','))
        .join('\n')

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `relatorio-${periodo}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } finally {
      setExportando(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-200 via-indigo-200 to-blue-300 dark:from-zinc-950 dark:via-violet-950/20 dark:to-purple-950/30" />
        <div className="absolute -top-24 -left-24 h-96 w-96 animate-pulse rounded-full bg-gradient-to-r from-violet-400/20 to-purple-500/20 blur-3xl" />
        <div
          className="absolute -bottom-32 -right-32 h-80 w-80 animate-pulse rounded-full bg-gradient-to-r from-indigo-400/20 to-violet-500/20 blur-3xl"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute left-1/4 top-1/3 h-64 w-64 animate-pulse rounded-full bg-gradient-to-r from-purple-400/10 to-fuchsia-400/10 blur-2xl"
          style={{ animationDelay: '4s' }}
        />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.9) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="sticky top-0 z-20 w-full border-b border-zinc-200/60 bg-white/90 shadow-lg shadow-zinc-100/50 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/90 dark:shadow-zinc-900/50">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-zinc-900 to-zinc-700 bg-clip-text text-xl font-bold text-transparent dark:from-zinc-100 dark:to-zinc-300 md:text-2xl">
                Relatorios Financeiros
              </h1>
              <p className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Analise detalhada das suas financas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="rounded-xl border border-zinc-200/60 bg-white/80 px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm backdrop-blur transition-all duration-200 hover:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 dark:border-white/10 dark:bg-zinc-800/80 dark:text-zinc-300"
            >
              <option value="3meses">Ultimos 3 meses</option>
              <option value="6meses">Ultimos 6 meses</option>
              <option value="1ano">Ultimo ano</option>
            </select>

            <button
              onClick={handleExportarCsv}
              disabled={exportando || receitasVsDespesas.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Download className="h-4 w-4" />
              {exportando ? 'Exportando...' : 'Exportar'}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-6 pb-6 lg:px-8">
        {erro && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50/90 p-4 text-sm text-red-700 shadow-sm dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            {erro}
          </div>
        )}

        <div className="mb-6 pt-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Total de Receitas"
              value={formatMoney(totalReceitas)}
              subtitle="Periodo selecionado"
              icon={TrendingUp}
              trendDirection={trendReceitas?.direction}
              trendLabel={trendReceitas?.label}
              color="green"
            />

            <StatCard
              title="Total de Despesas"
              value={formatMoney(totalDespesas)}
              subtitle="Periodo selecionado"
              icon={TrendingDown}
              trendDirection={trendDespesas?.direction}
              trendLabel={trendDespesas?.label}
              color="red"
            />

            <StatCard
              title="Saldo Acumulado"
              value={formatMoney(saldoTotal)}
              subtitle="Economia total"
              icon={PiggyBank}
              trendDirection={trendSaldo?.direction}
              trendLabel={trendSaldo?.label}
              color="blue"
            />
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="group rounded-2xl border border-zinc-200/60 bg-white/70 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-zinc-900/70">
            <div className="mb-4 flex items-center gap-3">
              <span className="text-lg">📊</span>
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Receitas vs Despesas</h3>
            </div>
            {possuiSerieFinanceira ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={receitasVsDespesas}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                  <XAxis dataKey="mes" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    formatter={(value) => [`R$ ${(value || 0).toLocaleString('pt-BR')}`, '']}
                    labelFormatter={(label) => `Mes: ${label}`}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Bar dataKey="receitas" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="despesas" fill="#ef4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-48 items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
                {carregando ? 'Carregando dados...' : 'Sem movimentacoes no periodo selecionado.'}
              </div>
            )}
          </div>

          <div className="group rounded-2xl border border-zinc-200/60 bg-white/70 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-zinc-900/70">
            <div className="mb-4 flex items-center gap-3">
              <span className="text-lg">🥧</span>
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Despesas por Categoria</h3>
            </div>
            {categorias.length ? (
              <>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={categorias} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" paddingAngle={2}>
                      {categorias.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`R$ ${(value || 0).toLocaleString('pt-BR')}`, 'Valor']}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 max-h-32 space-y-2 overflow-y-auto">
                  {categorias.map((categoria, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div className="mr-3 h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: categoria.color }} />
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">{categoria.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          R$ {(categoria.value || 0).toLocaleString('pt-BR')}
                        </span>
                        <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">({categoria.percentage ?? 0}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-48 items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
                {carregando ? 'Carregando dados...' : 'Sem despesas confirmadas no periodo.'}
              </div>
            )}
          </div>
        </div>

        <div className="group mb-6 rounded-2xl border border-zinc-200/60 bg-white/70 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-zinc-900/70">
          <div className="mb-6 text-center">
            <div className="mb-2 flex items-center justify-center gap-3">
              <span className="text-2xl">📈</span>
              <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">Evolucao do Saldo</h3>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Acompanhe o crescimento do seu patrimonio</p>
          </div>
          {possuiSerieSaldo ? (
            <ResponsiveContainer width="100%" height={340}>
              <AreaChart data={evolucaoSaldo}>
                <defs>
                  <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                <XAxis dataKey="mes" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  formatter={(value) => [`R$ ${(value || 0).toLocaleString('pt-BR')}`, 'Saldo']}
                  labelFormatter={(label) => `Mes: ${label}`}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Area type="monotone" dataKey="saldo" stroke="#8b5cf6" fill="url(#colorSaldo)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
              {carregando ? 'Carregando dados...' : 'Saldo inalterado no periodo selecionado.'}
            </div>
          )}
        </div>

        <div className="group relative mb-6 overflow-hidden rounded-2xl border border-purple-200/60 bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 p-6 shadow-xl transition-all duration-300 hover:shadow-2xl dark:border-purple-800/30 dark:from-purple-900/20 dark:via-violet-900/20 dark:to-indigo-900/20">
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br from-purple-400/20 to-violet-500/20 blur-2xl transition-all duration-700 group-hover:scale-125" />
          <div className="relative">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Insights Financeiros</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">Analise inteligente dos seus dados</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-white/60 p-4 backdrop-blur dark:bg-zinc-800/60">
                <h4 className="mb-2 flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
                  <span className="text-green-500">📈</span>
                  Tendencia
                </h4>
                <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {trendReceitas
                    ? `Suas receitas variaram ${trendReceitas.label}% em relacao ao periodo anterior.`
                    : 'Aguardando historico suficiente para calcular tendencias.'}
                </p>
              </div>

              <div className="rounded-xl bg-white/60 p-4 backdrop-blur dark:bg-zinc-800/60">
                <h4 className="mb-2 flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
                  <span className="text-amber-500">💡</span>
                  Observacao
                </h4>
                <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {categorias.length
                    ? `A categoria com maior participacao foi ${categorias[0].name}, representando ${categorias[0].percentage ?? 0}% das despesas.`
                    : 'Cadastre e categorize suas transacoes para receber insights personalizados.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
          Copyright 2024 MoneyMapp TCC. Todos os direitos reservados.
        </div>
      </div>
    </div>
  )
}
