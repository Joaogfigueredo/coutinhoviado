import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function NotFound() {
  const { token } = useAuth()
  return (
    <div className="max-w-lg mx-auto mt-16 text-center card p-8">
      <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">404 - Página não encontrada</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-4">A página pode ter sido removida ou estar indisponível.</p>
      <Link to={token ? '/dashboard' : '/home'} className="text-emerald-700 dark:text-emerald-400 hover:underline">
        Voltar
      </Link>
    </div>
  )
}
