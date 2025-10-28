import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const moneyFmt = (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`

export default function GraficoBarra({
  dados = [],
  chaveX = 'mes',
  chavesSeries = [
    { key: 'receitas', nome: 'Receitas', cor: '#10b981' },
    { key: 'despesas', nome: 'Despesas', cor: '#ef4444' },
  ],
}) {
  return (
    <div className="h-80 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dados}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey={chaveX} stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip 
            formatter={(v) => [moneyFmt(v), '']}
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
            labelStyle={{ color: '#f3f4f6' }}
          />
          <Legend />
          {chavesSeries.map((s) => (
            <Bar key={s.key} dataKey={s.key} name={s.nome} fill={s.cor} radius={[6,6,0,0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
