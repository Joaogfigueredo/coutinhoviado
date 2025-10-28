import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function BotaoVoltarHome() {
  const navigate = useNavigate()
  const { modoDemo } = useAuth()
  
  if (!modoDemo) return null
  
  return (
    <motion.button
      onClick={() => navigate('/home')}
      className="
        fixed top-4 left-4 z-50 
        bg-white/90 backdrop-blur-sm 
        text-gray-700 hover:text-blue-600
        border border-gray-200 hover:border-blue-300
        rounded-lg px-3 py-2 
        flex items-center gap-2 
        shadow-lg hover:shadow-xl
        transition-all duration-300 ease-in-out
        hover:scale-105 active:scale-95
        text-sm font-medium
      "
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      whileHover={{ x: -2 }}
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="hidden sm:inline">Voltar para Home</span>
      <Home className="w-4 h-4 sm:hidden" />
    </motion.button>
  )
}