import React from 'react'
import Botao from './Botao'

export default function Modal({ aberto, titulo, children, textoConfirmar = 'Salvar', onFechar, onConfirmar, carregando }) {
  if (!aberto) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 dark:bg-black/60" onClick={onFechar} />
      <div className="relative z-10 bg-white dark:bg-gray-800 rounded shadow-xl w-full max-w-md mx-4">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{titulo}</h3>
        </div>
        <div className="px-4 py-3 text-gray-900 dark:text-gray-100">
          {children}
        </div>
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
          <Botao variante="ghost" onClick={onFechar}>Cancelar</Botao>
          <Botao onClick={onConfirmar} carregando={carregando}>{textoConfirmar}</Botao>
        </div>
      </div>
    </div>
  )
}
