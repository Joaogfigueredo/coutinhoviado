import React from 'react'

export default function Botao({ children, variante = 'primario', carregando = false, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed'
  const estilos = variante === 'ghost'
    ? 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
    : 'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600'
  return (
    <button className={`${base} ${estilos}`} disabled={carregando || props.disabled} {...props}>
      {carregando && (
        <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
      )}
      {children}
    </button>
  )
}
