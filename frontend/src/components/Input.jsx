import React from 'react'

export default function Input({ rotulo, erro, tipo = 'text', placeholder, valor, onChange, ...props }) {
  return (
    <div className="w-full">
      {rotulo && <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">{rotulo}</label>}
      <input
        type={tipo}
        className={`w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${erro ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
        placeholder={placeholder}
        value={valor}
        onChange={onChange}
        {...props}
      />
      {erro && <div className="text-xs text-red-600 dark:text-red-400 mt-1">{erro}</div>}
    </div>
  )
}
