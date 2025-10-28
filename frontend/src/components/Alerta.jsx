import React from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

export default function Alerta({ tipo = 'info', mensagem, onClose, className = '' }) {
  const configuracoes = {
    sucesso: {
      classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: CheckCircle,
      iconColor: 'text-emerald-500'
    },
    erro: {
      classes: 'bg-red-50 text-red-800 border-red-200',
      icon: XCircle,
      iconColor: 'text-red-500'
    },
    info: {
      classes: 'bg-blue-50 text-blue-800 border-blue-200',
      icon: Info,
      iconColor: 'text-blue-500'
    }
  }

  const config = configuracoes[tipo] || configuracoes.info
  const IconComponent = config.icon

  return (
    <div className={`
      border rounded-lg px-4 py-3 text-sm flex items-center gap-3 
      ${config.classes} ${className}
      animate-in slide-in-from-top-2 duration-300 ease-out
    `}>
      <IconComponent className={`w-5 h-5 ${config.iconColor} flex-shrink-0`} />
      <span className="flex-1">{mensagem}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 hover:bg-black hover:bg-opacity-10 rounded-full transition-colors duration-200"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
