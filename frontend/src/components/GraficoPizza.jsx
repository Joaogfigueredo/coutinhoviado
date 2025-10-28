import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const cores = [
  '#10b981',
  '#0ea5e9',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#f472b6',
  '#22c55e',
  '#06b6d4',
]

const moneyFmt = (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`

export default function GraficoPizza({
  dados = [],
  chaveValor = 'valor',
  chaveNome = 'nome',
}) {
  return (
    <div className="h-80 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
      <ResponsiveContainer width="100%" height="100%">"
        <PieChart>
          <Pie
            data={dados}
            dataKey={chaveValor}
            nameKey={chaveNome}
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {dados.map((_, idx) => (
              <Cell key={idx} fill={cores[idx % cores.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v, n) => [moneyFmt(v), n]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
