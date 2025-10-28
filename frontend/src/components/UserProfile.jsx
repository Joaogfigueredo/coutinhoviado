import React, { useState } from 'react'
import { ChevronDown, User, Mail, LogOut, Edit2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'

export default function UserProfile() {
  const { usuario, sair } = useAuth() || {}
  const navigate = useNavigate()
  const [aberto, setAberto] = useState(false)

  // Se não há usuário, mostra um placeholder
  if (!usuario || !usuario.name) {
    return (
      <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse">
        <div className="flex h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600" />
        <div className="hidden lg:block w-24 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
      </button>
    )
  }

  const handleLogout = () => {
    if (sair) sair()
    localStorage.removeItem('demoMode')
    navigate('/home')
  }

  const goToSettings = () => {
    setAberto(false)
    navigate('/configuracoes')
  }

  const email = usuario.email || 'usuario@email.com'
  const initials = (usuario.name || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  return (
    <div className="relative">
      <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
        <button
          onClick={goToSettings}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white text-sm font-semibold flex-shrink-0 hover:shadow-lg hover:scale-110 transition-all duration-200 cursor-pointer"
          title="Clique para editar sua foto"
        >
          {usuario.avatarUrl ? (
            <img
              src={usuario.avatarUrl}
              alt={usuario.name}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </button>
        
        <button
          onClick={() => setAberto(!aberto)}
          className="hidden lg:flex lg:flex-col text-left hover:opacity-70 transition-opacity"
          title={`${usuario.name} (${email})`}
        >
          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {usuario.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {email}
          </div>
        </button>
        
        <button
          onClick={() => setAberto(!aberto)}
          className="hidden lg:inline"
        >
          <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Menu Dropdown */}
      {aberto && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {/* Informações do Usuário */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold flex-shrink-0">
                {usuario.avatarUrl ? (
                  <img
                    src={usuario.avatarUrl}
                    alt={usuario.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {usuario.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {usuario.email}
                </div>
              </div>
            </div>
          </div>

          {/* Detalhes do Usuário */}
          <div className="px-4 py-2 space-y-2">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">
              <User className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{usuario.name}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{usuario.email}</span>
            </div>
          </div>

          {/* Botão Sair */}
          <div className="px-2 py-2 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <button
              onClick={goToSettings}
              className="w-full flex items-center gap-2 px-3 py-2 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 text-sm font-medium"
            >
              <Edit2 className="h-4 w-4" />
              Editar Perfil
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 text-sm font-medium"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      )}

      {/* Overlay para fechar o menu */}
      {aberto && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setAberto(false)}
        />
      )}
    </div>
  )
}
