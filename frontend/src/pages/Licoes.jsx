import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Clock, 
  BookOpen, 
  CheckCircle,
  Play,
  Star,
  TrendingUp,
  Users,
  Target
} from 'lucide-react'
import { educacaoMock } from '../data/educacaoMock'

export default function Licoes() {
  const navigate = useNavigate()
  
  const getNivelCor = (nivel) => {
    switch (nivel) {
      case 'Básico':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'Intermediário':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'Avançado':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    }
  }

  const getIconeLicao = (id) => {
    const icones = {
      1: Users,
      2: Target,
      3: BookOpen,
      4: TrendingUp
    }
    return icones[id] || BookOpen
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/educacao')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-medium">Voltar para Educação</span>
          </button>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>4 lições disponíveis</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header da página */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Lições Práticas de Educação Financeira
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Aprenda os conceitos fundamentais de finanças pessoais através de lições práticas e interativas
          </p>
        </motion.div>

        {/* Estatísticas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center border border-gray-100 dark:border-gray-700">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">4</h3>
            <p className="text-gray-600 dark:text-gray-300">Lições Interativas</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center border border-gray-100 dark:border-gray-700">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">45</h3>
            <p className="text-gray-600 dark:text-gray-300">Minutos de conteúdo</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center border border-gray-100 dark:border-gray-700">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">100%</h3>
            <p className="text-gray-600 dark:text-gray-300">Conteúdo prático</p>
          </div>
        </motion.div>

        {/* Lista de lições */}
        <div className="space-y-6">
          {educacaoMock.licoes.map((licao, index) => {
            const IconeLicao = getIconeLicao(licao.id)
            
            return (
              <motion.div
                key={licao.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                onClick={() => navigate(`/educacao/licao/${licao.id}`)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-[1.02] group"
              >
                <div className="flex items-start gap-6">
                  {/* Ícone da lição */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <IconeLicao className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          Lição {licao.id}: {licao.titulo}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          {licao.descricao}
                        </p>
                      </div>
                      
                      <div className="flex items-center ml-4">
                        <Play className="w-6 h-6 text-blue-500 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                    
                    {/* Meta informações */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{licao.tempo}</span>
                      </div>
                      
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getNivelCor(licao.nivel)}`}>
                        {licao.nivel}
                      </span>
                    </div>
                    
                    {/* Tópicos */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tópicos abordados:</h4>
                      <div className="flex flex-wrap gap-2">
                        {licao.topicos.slice(0, 3).map((topico, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                          >
                            {topico}
                          </span>
                        ))}
                        {licao.topicos.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-xs">
                            +{licao.topicos.length - 3} mais
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* CTA */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Conteúdo prático e interativo
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                        Iniciar Lição
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-center text-white"
        >
          <h2 className="text-2xl font-bold mb-4">Pronto para começar sua jornada financeira?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Complete todas as lições para ter uma base sólida em educação financeira e tome melhores decisões com seu dinheiro.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/educacao/licao/1')}
              className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Começar pela Lição 1
            </button>
            <button
              onClick={() => navigate('/educacao/quiz')}
              className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-medium"
            >
              Fazer Quiz de Avaliação
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}