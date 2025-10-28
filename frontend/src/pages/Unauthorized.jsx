import React from 'react'
import { Lock } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 text-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 dark:text-slate-100 p-6">
      <div className="max-w-md w-full rounded-3xl border border-white/60 bg-white/70 p-10 backdrop-blur-lg shadow-xl text-center dark:border-slate-700 dark:bg-slate-900/70">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg dark:bg-slate-100 dark:text-slate-900">
          <Lock className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Sessão necessária</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
          Faça login para continuar. Caso você esteja em modo demonstração, tente recarregar a página.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            to="/login"
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Ir para o login
          </Link>
          <Link
            to="/"
            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-slate-400 hover:-translate-y-0.5 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  )
}
