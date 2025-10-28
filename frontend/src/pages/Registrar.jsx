import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'
import { User, Mail, Lock, PiggyBank, Sparkles, CheckCircle } from 'lucide-react'

export default function Registrar() {
  const { registrar } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nome: '', email: '', senha: '' })
  const [erro, setErro] = useState('')
  const [ok, setOk] = useState(false)
  const [loading, setLoading] = useState(false)

  function onChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setErro(''); setOk(false); setLoading(true)
    try {
      await registrar({ name: form.nome, email: form.email, password: form.senha })
      setOk(true)
      setTimeout(() => navigate('/dashboard', { replace: true }), 600)
    } catch (e) {
      setErro(e?.response?.data?.error || 'Falha ao registrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden transition-colors duration-300">
      {/* Fundo premium */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-400 to-cyan-500 transition-colors duration-300 dark:from-slate-950 dark:via-emerald-950/20 dark:to-slate-950" />
        <div className="absolute -top-40 -left-40 h-80 w-80 animate-pulse rounded-full bg-gradient-to-r from-green-400/30 to-emerald-500/30 blur-3xl dark:from-emerald-600/20 dark:to-teal-700/20" />
        <div
          className="absolute -bottom-40 -right-40 h-96 w-96 animate-pulse rounded-full bg-gradient-to-r from-teal-400/20 to-cyan-500/20 blur-3xl dark:from-teal-700/20 dark:to-cyan-800/20"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute left-1/3 top-1/4 h-64 w-64 animate-pulse rounded-full bg-gradient-to-r from-emerald-400/10 to-green-400/10 blur-2xl dark:from-emerald-700/10 dark:to-green-700/10"
          style={{ animationDelay: '4s' }}
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md backdrop-blur-lg bg-white/20 rounded-3xl border border-white/30 shadow-2xl p-8 transition-colors duration-300 dark:bg-slate-900/50 dark:border-slate-700/60"
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 shadow-lg">
              <PiggyBank className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-xl font-bold text-white">MoneyMapp</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-sm dark:text-slate-100">Junte-se a nós!</h1>
          <p className="text-white/80 font-medium dark:text-slate-300/90">Crie sua conta e comece sua jornada financeira</p>
        </motion.div>

        {ok && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 text-sm text-emerald-100 bg-emerald-500/30 backdrop-blur-sm border border-emerald-400/50 rounded-2xl p-4 flex items-center gap-2 dark:bg-emerald-500/20 dark:border-emerald-500/40"
          >
            <CheckCircle className="w-4 h-4 text-emerald-300" />
            Conta criada! Redirecionando…
          </motion.div>
        )}
        {erro && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-sm text-red-100 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-2xl p-4 dark:bg-red-500/15"
          >
            {erro}
          </motion.div>
        )}

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          onSubmit={onSubmit} 
          className="space-y-6"
        >
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="space-y-2"
          >
            <label className="block text-sm font-bold text-white/90 dark:text-slate-200">Nome</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5 dark:text-slate-300/80" />
              <input
                required 
                type="text" 
                name="nome" 
                value={form.nome} 
                onChange={onChange}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 shadow-sm dark:border-slate-600/80 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder-slate-400"
                placeholder="Digite seu nome"
              />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="space-y-2"
          >
            <label className="block text-sm font-bold text-white/90 dark:text-slate-200">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5 dark:text-slate-300/80" />
              <input
                required 
                type="email" 
                name="email" 
                value={form.email} 
                onChange={onChange}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 shadow-sm dark:border-slate-600/80 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder-slate-400"
                placeholder="Digite seu e-mail"
              />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="space-y-2"
          >
            <label className="block text-sm font-bold text-white/90 dark:text-slate-200">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5 dark:text-slate-300/80" />
              <input
                required 
                type="password" 
                name="senha" 
                value={form.senha} 
                onChange={onChange}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 shadow-sm dark:border-slate-600/80 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder-slate-400"
                placeholder="Digite sua senha"
              />
            </div>
          </motion.div>

          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Cadastrando...
              </div>
            ) : (
              'Criar conta'
            )}
          </motion.button>
        </motion.form>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="text-center mt-8"
        >
          <p className="text-white/80 font-medium dark:text-slate-300">
            Já tem conta?{' '}
            <Link 
              to="/login" 
              className="text-yellow-300 font-bold hover:text-yellow-200 transition-colors duration-300 underline underline-offset-2 dark:text-amber-300 dark:hover:text-amber-200"
            >
              Fazer login
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
