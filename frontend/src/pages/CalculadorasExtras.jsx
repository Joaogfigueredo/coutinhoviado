import React, { useMemo, useState } from 'react'
import { jurosCompostos, parcelaPrice, cronogramaSAC, custoDeVida } from '../utils/finance.js'

export default function CalculadorasExtras() {
  const [pv, setPv] = useState(1000)
  const [rate, setRate] = useState(0.01)
  const [periods, setPeriods] = useState(12)

  const fv = useMemo(() => jurosCompostos(Number(pv) || 0, Number(rate) || 0, Number(periods) || 0), [pv, rate, periods])
  const price = useMemo(() => parcelaPrice(10000, 0.02, 24), [])
  const sac = useMemo(() => cronogramaSAC(10000, 0.02, 6), [])
  const custo = useMemo(() => custoDeVida(36000, 0.05, 5), [])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Calculadoras Financeiras</h1>

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Juros Compostos</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            type="number"
            value={pv}
            min="0"
            onChange={(event) => setPv(Number(event.target.value))}
            placeholder="Valor presente"
          />
          <input
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            type="number"
            step="0.001"
            value={rate}
            onChange={(event) => setRate(Number(event.target.value))}
            placeholder="Taxa (ex.: 0.01)"
          />
          <input
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            type="number"
            min="0"
            value={periods}
            onChange={(event) => setPeriods(Number(event.target.value))}
            placeholder="Períodos"
          />
        </div>
        <div className="rounded-lg bg-violet-50 px-3 py-2 text-sm font-medium text-violet-800 dark:bg-violet-900/20 dark:text-violet-100">
          Valor futuro estimado: {fv.toFixed(2)}
        </div>
      </section>

      <section className="space-y-2 rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Parcela Price</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Para um empréstimo de R$10.000 a 2% ao mês em 24 parcelas, a parcela fica em{' '}
          <strong>R$ {price.toFixed(2)}</strong>.
        </p>
      </section>

      <section className="space-y-2 rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Cronograma SAC</h2>
        <pre className="max-h-64 overflow-auto rounded-lg bg-slate-900/80 p-3 text-xs text-slate-100">
          {JSON.stringify(sac, null, 2)}
        </pre>
      </section>

      <section className="space-y-2 rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Custo de Vida Projetado</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Um custo anual de R$36.000 com inflação de 5% ao ano torna-se{' '}
          <strong>R$ {custo.toFixed(2)}</strong> em cinco anos.
        </p>
      </section>
    </div>
  )
}
