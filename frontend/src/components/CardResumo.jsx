import React from 'react'

export default function CardResumo({ titulo, valor, subtexto, cor = 'emerald' }) {
  const map = {
    red: 'text-rose-600',
    blue: 'text-blue-600',
    emerald: 'text-emerald-600',
    purple: 'text-purple-600',
  }
  const corTexto = map[cor] || map.emerald

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="text-sm text-gray-600 dark:text-gray-400">{titulo}</div>
      <div className={`mt-1 text-2xl font-bold ${corTexto}`}>{valor}</div>
      {subtexto && <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{subtexto}</div>}
    </div>
  )
}
