import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { PiggyBank, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function DemoLoading() {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirecionar para o dashboard após 1.5s
    const timer = setTimeout(() => {
      navigate('/dashboard', { replace: true })
    }, 1500)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center px-4">
      <motion.div
        className="text-center text-white"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo animado */}
        <motion.div
          className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          animate={{ 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1] 
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <PiggyBank className="w-10 h-10 text-white" />
        </motion.div>

        {/* Título */}
        <motion.h1
          className="text-3xl md:text-4xl font-bold mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Iniciando Demonstração
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          className="text-xl mb-8 text-blue-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Preparando seu painel financeiro...
        </motion.p>

        {/* Loading spinner */}
        <motion.div
          className="flex items-center justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg">Carregando dados demo</span>
        </motion.div>

        {/* Pontos de progresso */}
        <motion.div
          className="flex justify-center gap-2 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-white/40 rounded-full"
              animate={{
                backgroundColor: ["rgba(255,255,255,0.4)", "rgba(255,255,255,0.9)", "rgba(255,255,255,0.4)"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>

        {/* Informação adicional */}
        <motion.div
          className="mt-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <p className="text-sm text-blue-100">
            💡 <strong>Modo Demonstração:</strong> Todos os dados exibidos são fictícios e criados para fins educativos.
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}