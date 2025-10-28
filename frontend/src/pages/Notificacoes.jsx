import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Bell,
  BellRing,
  CheckCircle2,
  CircleX,
  Info,
  RefreshCcw,
  Trash2,
  Eye,
  Calendar,
  TrendingUp,
  AlertCircle,
  Zap,
  Target,
  DollarSign,
  Clock,
  Badge,
  BarChart3,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import api from '../services/api'
import Button from '../components/ui/Button.jsx'
import { SkeletonList } from '../components/ui/Skeleton.jsx'
import { dadosDemo } from '../data/dadosDemo.js'

// Configuração moderna com glassmorphism e gradientes animados
const severityConfig = {
  info: {
    icon: Info,
    dot: 'bg-gradient-to-r from-blue-400 to-cyan-500',
    border: 'border-blue-200/50 dark:border-blue-700/50',
    badge: 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-700 dark:text-blue-300 border border-blue-200/30 dark:border-blue-700/30',
    priority: 'baixa',
    color: '#3B82F6',
  },
  success: {
    icon: CheckCircle2,
    dot: 'bg-gradient-to-r from-emerald-400 to-green-500',
    border: 'border-emerald-200/50 dark:border-emerald-700/50',
    badge: 'bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200/30 dark:border-emerald-700/30',
    priority: 'baixa',
    color: '#10B981',
  },
  warning: {
    icon: AlertTriangle,
    dot: 'bg-gradient-to-r from-amber-400 to-orange-500',
    border: 'border-amber-200/50 dark:border-amber-700/50',
    badge: 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-700 dark:text-amber-300 border border-amber-200/30 dark:border-amber-700/30',
    priority: 'média',
    color: '#F59E0B',
  },
  error: {
    icon: CircleX,
    dot: 'bg-gradient-to-r from-rose-400 to-red-500',
    border: 'border-rose-200/50 dark:border-rose-700/50',
    badge: 'bg-gradient-to-r from-rose-500/10 to-red-500/10 text-rose-700 dark:text-rose-300 border border-rose-200/30 dark:border-rose-700/30',
    priority: 'alta',
    color: '#EF4444',
  },
}

// Configuração expandida de tipos com ícones dedicados
const typeLabels = {
  system: { label: 'Sistema', icon: Zap, category: 'Sistema' },
  transaction: { label: 'Transação', icon: DollarSign, category: 'Financeiro' },
  recurring: { label: 'Recorrência', icon: Clock, category: 'Recorrência' },
  budget: { label: 'Orçamento', icon: BarChart3, category: 'Alerta financeiro' },
  goal: { label: 'Meta', icon: Target, category: 'Objetivos' },
  reminder: { label: 'Lembrete', icon: Bell, category: 'Sistema' },
  BUDGET_THRESHOLD: { label: 'Limite de Orçamento', icon: TrendingUp, category: 'Alerta financeiro' },
  DEBT_DUE: { label: 'Vencimento de Dívida', icon: AlertCircle, category: 'Alerta financeiro' },
  GOAL_REACHED: { label: 'Meta Atingida', icon: Target, category: 'Conquista' },
}

// Configuração de prioridade visual
const priorityConfig = {
  alta: {
    badge: 'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-700 dark:text-red-300 border border-red-200/40',
    pulse: 'animate-pulse',
  },
  média: {
    badge: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-700 dark:text-amber-300 border border-amber-200/40',
    pulse: '',
  },
  baixa: {
    badge: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 dark:text-blue-300 border border-blue-200/40',
    pulse: '',
  },
}

const filters = [
  { value: 'all', label: 'Todas' },
  { value: 'unread', label: 'Não lidas' },
  { value: 'read', label: 'Lidas' },
]

const perPage = 10

const announceRefresh = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('moneymapp:notifications:refresh'))
  }
}

const readDemoNotifications = () => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('mm_demo_notifications')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          return parsed.map((item) => ({ ...item }))
        }
      }
    } catch (error) {
      console.warn('Falha ao ler notificações demo do storage:', error)
    }
  }

  return (dadosDemo.notificacoes ?? []).map((item) => ({ ...item }))
}

const formatDateTime = (value) => {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--'
  return `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
}

const formatRelativeTime = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffMinutes = Math.round(diffMs / 60000)
  const absMinutes = Math.abs(diffMinutes)

  const formatter = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })
  if (absMinutes < 60) {
    return formatter.format(diffMinutes, 'minute')
  }
  const diffHours = Math.round(diffMinutes / 60)
  const absHours = Math.abs(diffHours)
  if (absHours < 24) {
    return formatter.format(diffHours, 'hour')
  }
  const diffDays = Math.round(diffHours / 24)
  if (Math.abs(diffDays) < 7) {
    return formatter.format(diffDays, 'day')
  }
  const diffWeeks = Math.round(diffDays / 7)
  if (Math.abs(diffWeeks) < 5) {
    return formatter.format(diffWeeks, 'week')
  }
  const diffMonths = Math.round(diffDays / 30)
  if (Math.abs(diffMonths) < 12) {
    return formatter.format(diffMonths, 'month')
  }
  const diffYears = Math.round(diffDays / 365)
  return formatter.format(diffYears, 'year')
}

// Modal moderno para detalhes da notificação
function NotificationModal({ notification, isOpen, onClose }) {
  if (!isOpen || !notification) return null

  const severity = severityConfig[notification.severity] ?? severityConfig.info
  const typeInfo = typeLabels[notification.type] ?? { label: 'Aviso', icon: Bell, category: 'Sistema' }
  const TypeIcon = typeInfo.icon
  const SeverityIcon = severity.icon

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="relative max-w-2xl w-full max-h-[90vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Glassmorphism background */}
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/30 shadow-2xl shadow-purple-500/10">
            {/* Header com gradiente */}
            <div className="bg-gradient-to-r from-purple-500/10 via-violet-500/10 to-blue-500/10 p-6 rounded-t-3xl border-b border-white/10 dark:border-slate-700/30">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${severity.dot} shadow-lg`}>
                    <SeverityIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {notification.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <TypeIcon className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        {typeInfo.category}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <CircleX className="h-5 w-5 text-slate-500" />
                </button>
              </div>
            </div>
            
            {/* Conteúdo */}
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Mensagem</h3>
                <p className="text-slate-900 dark:text-slate-100 leading-relaxed">
                  {notification.message}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Informações</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Data de criação:</span>
                      <span className="text-slate-900 dark:text-slate-100">{formatDateTime(notification.createdAt)}</span>
                    </div>
                    {notification.readAt && (
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Lida em:</span>
                        <span className="text-slate-900 dark:text-slate-100">{formatDateTime(notification.readAt)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Severidade:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${severity.badge}`}>
                        {notification.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {notification.metadata && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Detalhes Técnicos</h3>
                    <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-3 rounded-xl overflow-auto max-h-32">
                      {JSON.stringify(notification.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Card de notificação moderno com glassmorphism
function NotificacaoCard({ notification, onMarkRead, onMarkUnread, onRemove, index }) {
  const [showModal, setShowModal] = useState(false)
  const severity = severityConfig[notification.severity] ?? severityConfig.info
  const typeInfo = typeLabels[notification.type] ?? { label: 'Aviso', icon: Bell, category: 'Sistema' }
  const priority = priorityConfig[severity.priority] ?? priorityConfig.baixa
  
  const SeverityIcon = severity.icon
  const TypeIcon = typeInfo.icon
  const relativeTime = formatRelativeTime(notification.createdAt)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 0.4, 
          delay: index * 0.1,
          type: "spring",
          stiffness: 100 
        }}
        whileHover={{ 
          y: -4, 
          scale: 1.02,
          transition: { duration: 0.2 }
        }}
        className="group relative"
      >
        {/* Timeline dot - barra lateral animada */}
        <div className="absolute -left-8 top-6 hidden md:block">
          <motion.div 
            className={`w-3 h-3 rounded-full ${severity.dot} shadow-lg ${!notification.read ? priority.pulse : ''}`}
            whileHover={{ scale: 1.3 }}
            transition={{ type: "spring", stiffness: 400 }}
          />
          <div className="absolute top-6 left-1/2 w-0.5 h-16 bg-gradient-to-b from-purple-200 to-transparent dark:from-purple-700/50 transform -translate-x-1/2" />
        </div>
        
        {/* Card principal com glassmorphism */}
        <div className={`
          relative overflow-hidden rounded-3xl border backdrop-blur-xl
          bg-white/80 dark:bg-slate-900/80 
          ${severity.border}
          shadow-lg shadow-purple-500/5 dark:shadow-purple-500/10
          hover:shadow-xl hover:shadow-purple-500/10 dark:hover:shadow-purple-500/20
          transition-all duration-300
        `}>
          {/* Brilho sutil de fundo */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-purple-500/5 dark:from-slate-800/50 dark:to-purple-500/10" />
          
          {/* Badge "Novo" animado para não lidas */}
          {!notification.read && (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-4 right-4 z-10"
            >
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg">
                <Badge className="h-3 w-3" />
                Novo
              </span>
            </motion.div>
          )}
          
          <div className="relative p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              {/* Conteúdo principal */}
              <div className="flex-1 space-y-4">
                {/* Header com ícones */}
                <div className="flex items-start gap-4">
                  <motion.div 
                    className={`p-3 rounded-2xl ${severity.dot} shadow-lg`}
                    whileHover={{ rotate: 12, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <SeverityIcon className="h-5 w-5 text-white" />
                  </motion.div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Badges informativos */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <motion.span 
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${severity.badge}`}
                        whileHover={{ scale: 1.05 }}
                      >
                        <TypeIcon className="h-3.5 w-3.5" />
                        {typeInfo.label}
                      </motion.span>
                      
                      <span className={`px-2 py-1 text-xs font-bold rounded-lg ${priority.badge}`}>
                        {severity.priority.toUpperCase()}
                      </span>
                      
                      <span className="px-2 py-1 text-xs rounded-lg bg-slate-100/80 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300">
                        {typeInfo.category}
                      </span>
                    </div>
                    
                    {/* Título e descrição */}
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                      {notification.message}
                    </p>
                    
                    {/* Informações de data */}
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDateTime(notification.createdAt)}</span>
                      </div>
                      {relativeTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>({relativeTime})</span>
                        </div>
                      )}
                      {notification.readAt && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          ✓ Lida em {formatDateTime(notification.readAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Status visual aprimorado */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {notification.read ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200/30 dark:border-emerald-700/30">
                        <CheckCircle2 className="h-3 w-3" />
                        Lida
                      </span>
                    ) : (
                      <motion.span 
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500/10 to-violet-500/10 text-purple-700 dark:text-purple-300 border border-purple-200/30 dark:border-purple-700/30"
                      >
                        <BellRing className="h-3 w-3" />
                        Não lida
                      </motion.span>
                    )}
                  </div>
                  
                  {/* Botão Ver detalhes destacado */}
                  <motion.button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Eye className="h-4 w-4" />
                    Ver detalhes
                  </motion.button>
                </div>
              </div>
              
              {/* Ações */}
              <div className="flex lg:flex-col items-center gap-2 lg:w-auto w-full">
                {notification.read ? (
                  <motion.button
                    onClick={() => onMarkUnread(notification)}
                    className="flex-1 lg:flex-none px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Marcar como não lida
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={() => onMarkRead(notification)}
                    className="flex-1 lg:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Marcar como lida
                  </motion.button>
                )}
                
                <motion.button
                  onClick={() => onRemove(notification)}
                  className="px-4 py-2 rounded-xl border border-rose-300 dark:border-rose-600 bg-rose-50/50 dark:bg-rose-900/20 backdrop-blur-sm text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Trash2 className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Modal de detalhes */}
      <NotificationModal 
        notification={notification}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  )
}

// Componente de estatísticas com gráficos
function NotificationStats({ notifications, meta }) {
  // Preparar dados para os gráficos
  const typeStats = Object.entries(typeLabels).map(([key, config]) => {
    const count = notifications.filter(n => n.type === key).length
    return {
      name: config.label,
      value: count,
      color: severityConfig[notifications.find(n => n.type === key)?.severity || 'info'].color
    }
  }).filter(item => item.value > 0)

  const severityStats = Object.entries(severityConfig).map(([key, config]) => {
    const count = notifications.filter(n => n.severity === key).length
    return {
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: count,
      color: config.color
    }
  }).filter(item => item.value > 0)

  const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444']

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Cards de estatísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-purple-500/10 to-violet-600/10 backdrop-blur-xl rounded-2xl p-4 border border-purple-200/30 dark:border-purple-700/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-600 dark:text-purple-400">Total</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{meta.total}</p>
            </div>
            <Bell className="h-8 w-8 text-purple-500" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-rose-500/10 to-pink-600/10 backdrop-blur-xl rounded-2xl p-4 border border-rose-200/30 dark:border-rose-700/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-rose-600 dark:text-rose-400">Não lidas</p>
              <p className="text-2xl font-bold text-rose-900 dark:text-rose-100">{meta.unreadCount}</p>
            </div>
            <BellRing className="h-8 w-8 text-rose-500" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-emerald-500/10 to-green-600/10 backdrop-blur-xl rounded-2xl p-4 border border-emerald-200/30 dark:border-emerald-700/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Lidas</p>
              <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{meta.total - meta.unreadCount}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 backdrop-blur-xl rounded-2xl p-4 border border-amber-200/30 dark:border-amber-700/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Alertas</p>
              <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                {notifications.filter(n => n.severity === 'warning' || n.severity === 'error').length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-amber-500" />
          </div>
        </motion.div>
      </div>

      {/* Gráficos */}
      {(typeStats.length > 0 || severityStats.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de tipos */}
          {typeStats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/30 p-6"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                Por Categoria
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeStats}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Gráfico de severidade */}
          {severityStats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/30 p-6"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                Por Severidade
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {severityStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {severityStats.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2 text-xs">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-slate-600 dark:text-slate-400">
                      {entry.name}: {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default function Notificacoes() {
  const demoMode = useMemo(() => localStorage.getItem('demoMode') === 'true', [])
  const [demoStore, setDemoStore] = useState(() => readDemoNotifications())
  const [filtro, setFiltro] = useState('unread')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notifications, setNotifications] = useState([])
  const [meta, setMeta] = useState({ total: 0, unreadCount: 0, totalPages: 1, page: 1, perPage })

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      if (demoMode) {
        const all = demoStore
        const unreadCount = all.filter((item) => !item.readAt).length
        const base = filtro === 'unread' ? all.filter((item) => !item.readAt) : filtro === 'read' ? all.filter((item) => item.readAt) : all
        const total = base.length
        const totalPages = Math.max(Math.ceil(total / perPage), 1)
        const currentPage = Math.min(page, totalPages)
        const start = (currentPage - 1) * perPage
        const sliced = base.slice(start, start + perPage).map((item) => ({ ...item, read: Boolean(item.readAt) }))
        setNotifications(sliced)
        setMeta({ total, unreadCount, totalPages, page: currentPage, perPage })
        if (currentPage !== page) {
          setPage(currentPage)
        }
      } else {
        const params = { status: filtro }
        if (page) params.page = page
        params.perPage = perPage
        const { data } = await api.notifications.listar(params)
        setNotifications((data?.notifications ?? []).map((item) => ({
          ...item,
          read: typeof item.read === 'boolean' ? item.read : Boolean(item.readAt),
        })))
        const metaPayload = data?.meta ?? {}
        setMeta({
          total: metaPayload.total ?? 0,
          unreadCount: metaPayload.unreadCount ?? 0,
          totalPages: metaPayload.totalPages ?? 1,
          page: metaPayload.page ?? page,
          perPage: metaPayload.perPage ?? perPage,
        })
      }
    } catch (err) {
      const message = err?.response?.data?.error || 'Não foi possível carregar as notificações.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [demoMode, demoStore, filtro, page, perPage])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    setPage(1)
  }, [filtro])

  useEffect(() => {
    if (!demoMode || typeof window === 'undefined') return
    try {
      localStorage.setItem('mm_demo_notifications', JSON.stringify(demoStore))
      announceRefresh()
    } catch (error) {
      console.warn('Falha ao persistir notificações demo:', error)
    }
  }, [demoMode, demoStore])

  const handleRefresh = () => {
    fetchNotifications()
  }

  const handleMarkAll = async () => {
    try {
      if (demoMode) {
        const now = new Date().toISOString()
        setDemoStore((current) => current.map((item) => ({ ...item, readAt: item.readAt ?? now })))
        return
      }
      await api.notifications.marcarTodasComoLidas()
      await fetchNotifications()
      announceRefresh()
    } catch (err) {
      const message = err?.response?.data?.error || 'Não foi possível marcar todas como lidas.'
      setError(message)
    }
  }

  const handleMarkRead = async (notification) => {
    try {
      if (demoMode) {
        const now = new Date().toISOString()
        setDemoStore((current) => current.map((item) => (item.id === notification.id ? { ...item, readAt: now } : item)))
        return
      }
      await api.notifications.marcarComoLida(notification.id)
      await fetchNotifications()
      announceRefresh()
    } catch (err) {
      const message = err?.response?.data?.error || 'Não foi possível marcar como lida.'
      setError(message)
    }
  }

  const handleMarkUnread = async (notification) => {
    try {
      if (demoMode) {
        setDemoStore((current) => current.map((item) => (item.id === notification.id ? { ...item, readAt: null } : item)))
        return
      }
      await api.notifications.marcarComoNaoLida(notification.id)
      await fetchNotifications()
      announceRefresh()
    } catch (err) {
      const message = err?.response?.data?.error || 'Não foi possível marcar como não lida.'
      setError(message)
    }
  }

  const handleRemove = async (notification) => {
    try {
      if (demoMode) {
        setDemoStore((current) => current.filter((item) => item.id !== notification.id))
        return
      }
      await api.notifications.remover(notification.id)
      await fetchNotifications()
      announceRefresh()
    } catch (err) {
      const message = err?.response?.data?.error || 'Não foi possível remover a notificação.'
      setError(message)
    }
  }

  const showEmpty = !loading && notifications.length === 0
  const canGoBack = meta.page > 1
  const canGoForward = meta.page < meta.totalPages

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30 dark:from-slate-900 dark:via-purple-900/10 dark:to-blue-900/10">
      <div className="container mx-auto px-4 py-8 space-y-8">
        
        {/* Header moderno com glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-xl shadow-purple-500/10"
        >
          {/* Brilho de fundo animado */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-violet-500/5 to-blue-500/5 dark:from-purple-500/10 dark:via-violet-500/10 dark:to-blue-500/10" />
          
          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Título com ícone animado */}
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-violet-600 shadow-lg shadow-purple-500/25"
                >
                  <Bell className="h-8 w-8 text-white" />
                </motion.div>
                
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-purple-800 to-violet-900 dark:from-white dark:via-purple-200 dark:to-violet-200 bg-clip-text text-transparent">
                    Central de Notificações
                  </h1>
                  <p className="text-slate-600 dark:text-slate-300 mt-1">
                    Acompanhe alertas automáticos e mensagens importantes do MoneyMap
                  </p>
                  
                  {/* Contador animado de não lidas */}
                  {meta.unreadCount > 0 && (
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-200/30 dark:border-red-700/30"
                    >
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-sm font-semibold text-red-700 dark:text-red-300">
                        {meta.unreadCount} não lida{meta.unreadCount > 1 ? 's' : ''}
                      </span>
                    </motion.div>
                  )}
                </div>
              </div>
              
              {/* Botões de ação com gradientes */}
              <div className="flex flex-wrap items-center gap-3">
                <motion.button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50 transition-all duration-200 shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    animate={loading ? { rotate: 360 } : {}}
                    transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}
                  >
                    <RefreshCcw className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                  </motion.div>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Atualizar</span>
                </motion.button>
                
                <motion.button
                  onClick={handleMarkAll}
                  disabled={loading || meta.unreadCount === 0}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold shadow-lg hover:shadow-xl disabled:shadow-none transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Marcar todas como lidas
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Estatísticas - sempre visível quando há dados */}
        {notifications.length > 0 && (
          <NotificationStats notifications={notifications} meta={meta} />
        )}

        {/* Filtros modernos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap gap-3"
        >
          {filters.map((item, index) => {
            const active = filtro === item.value
            return (
              <motion.button
                key={item.value}
                onClick={() => setFiltro(item.value)}
                className={`
                  relative overflow-hidden px-6 py-3 rounded-2xl font-semibold transition-all duration-300
                  ${active 
                    ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/25' 
                    : 'bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {active && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-violet-400/20"
                    layoutId="activeFilter"
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {item.label}
                  {item.value === 'unread' && meta.unreadCount > 0 && (
                    <motion.span
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className={`
                        inline-flex h-6 min-w-[24px] items-center justify-center rounded-full px-2 text-xs font-bold
                        ${active 
                          ? 'bg-white/90 text-purple-600' 
                          : 'bg-gradient-to-r from-purple-500 to-violet-600 text-white'
                        }
                      `}
                    >
                      {meta.unreadCount}
                    </motion.span>
                  )}
                </span>
              </motion.button>
            )
          })}
        </motion.div>

        {/* Mensagem de erro elegante */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500/10 to-rose-500/10 backdrop-blur-xl border border-red-200/30 dark:border-red-700/30 p-6"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-xl bg-red-500/20">
                  <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-200 mb-1">Erro ao carregar notificações</h3>
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Conteúdo principal */}
        <div className="relative">
          {loading ? (
            <SkeletonList items={4} />
          ) : showEmpty ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center gap-6 rounded-3xl border-2 border-dashed border-slate-300/50 dark:border-slate-600/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-16 text-center"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-6 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600"
              >
                <Bell className="h-16 w-16 text-slate-400 dark:text-slate-500" />
              </motion.div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">
                  Tudo em ordem por aqui!
                </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md">
                  Nenhuma notificação {filtro === 'read' ? 'lida' : filtro === 'unread' ? 'não lida' : 'registrada'} no momento. 
                  Quando houver alertas importantes, eles aparecerão aqui.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {/* Timeline lateral para desktop */}
              <div className="hidden md:block absolute left-0 top-8 bottom-8 w-px bg-gradient-to-b from-purple-200 via-purple-300 to-transparent dark:from-purple-700 dark:via-purple-600" />
              
              {/* Lista de notificações */}
              <div className="md:pl-12 space-y-6">
                <AnimatePresence mode="popLayout">
                  {notifications.map((notification, index) => (
                    <NotificacaoCard
                      key={notification.id}
                      notification={{ ...notification, read: Boolean(notification.read ?? notification.readAt) }}
                      onMarkRead={handleMarkRead}
                      onMarkUnread={handleMarkUnread}
                      onRemove={handleRemove}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* Paginação moderna */}
        <AnimatePresence>
          {!showEmpty && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg"
            >
              <div className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                Página <span className="text-purple-600 dark:text-purple-400 font-bold">{meta.page}</span> de {meta.totalPages} • 
                <span className="text-purple-600 dark:text-purple-400 font-bold"> {meta.total}</span> notificações
              </div>
              
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => canGoBack && setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={!canGoBack || loading}
                  className="px-4 py-2 rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 text-slate-700 dark:text-slate-300 font-medium hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Anterior
                </motion.button>
                
                <motion.button
                  onClick={() => canGoForward && setPage((prev) => prev + 1)}
                  disabled={!canGoForward || loading}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-medium shadow-lg hover:shadow-xl disabled:shadow-none transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Próxima
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
      </div>
    </div>
  )
}
