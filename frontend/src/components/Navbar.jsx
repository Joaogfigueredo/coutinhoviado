import React from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { PiggyBank, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import UserProfile from './UserProfile.jsx'

export default function Navbar() {
  const { token, sair, usuario } = useAuth()
  const navigate = useNavigate()

  const linkClass = ({ isActive }) =>
    `hidden md:inline text-sm px-3 py-1.5 rounded border transition-colors duration-200
     ${isActive ? 'bg-gray-100 border-gray-300 text-slate-900 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100' : 'border-transparent hover:bg-gray-50 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white'}`

  function aoSair() {
    sair()
    navigate('/login', { replace: true })
  }

  return (
    <header className="border-b border-gray-200 bg-white transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link
          to={token ? '/dashboard' : '/home'}
          className="inline-flex items-center gap-3 text-slate-900 transition-colors duration-300 dark:text-slate-100"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-white via-blue-50/60 to-blue-100/60 shadow-[0_10px_30px_-18px_rgba(37,99,235,0.55)] ring-1 ring-blue-100 transition-colors duration-300 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700/80 dark:ring-slate-600">
            <PiggyBank className="h-5 w-5 text-slate-700 transition-colors duration-300 dark:text-slate-200" />
          </span>
          <span className="text-lg font-semibold tracking-tight">MoneyMapp</span>
        </Link>

        {token ? (
          <div className="flex items-center gap-2">
            {/* Links principais quando autenticado */}
            <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
            <NavLink to="/transacoes" className={linkClass}>Transações</NavLink>
            <NavLink to="/metas" className={linkClass}>Metas</NavLink>
            <NavLink to="/relatorios" className={linkClass}>Relatórios</NavLink>
            <NavLink to="/educacao" className={linkClass}>Educação</NavLink>
            <NavLink to="/notificacoes" className={linkClass}>Notificações</NavLink>
            <NavLink to="/configuracoes" className={linkClass}>Configurações</NavLink>

            {/* Perfil do Usuário */}
            <div className="border-l border-gray-200 dark:border-slate-700 pl-2 ml-2">
              <UserProfile />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="rounded border px-3 py-1.5 text-sm transition-colors duration-200 hover:bg-gray-50 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white">Entrar</Link>
            <Link to="/registrar" className="rounded border px-3 py-1.5 text-sm transition-colors duration-200 hover:bg-gray-50 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white">Criar conta</Link>
          </div>
        )}
      </div>
    </header>
  )
}
