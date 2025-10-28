import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Clock, 
  BarChart3, 
  BookOpen, 
  PiggyBank,
  TrendingDown,
  Calculator,
  TrendingUp,
  CheckCircle,
  Lightbulb,
  Target,
  AlertTriangle
} from 'lucide-react'
import { educacaoMock } from '../data/educacaoMock'

const iconMap = {
  'piggy-bank': PiggyBank,
  'trending-down': TrendingDown,
  'calculator': Calculator,
  'trending-up': TrendingUp
}

const corMap = {
  blue: 'from-blue-500 to-blue-600',
  red: 'from-red-500 to-red-600', 
  green: 'from-green-500 to-green-600',
  purple: 'from-purple-500 to-purple-600'
}

export default function LicaoDetalhes() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [licaoLida, setLicaoLida] = useState(false)
  
  // TODO: integrar com backend - buscar lição por ID
  const licao = educacaoMock.licoes.find(l => l.id === parseInt(id))
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 800)
    
    return () => clearTimeout(timer)
  }, [])
  
  useEffect(() => {
    // Simular progresso de leitura
    const timer = setTimeout(() => {
      setLicaoLida(true)
      // TODO: integrar com backend - marcar lição como lida
    }, 10000) // 10 segundos simulando leitura
    
    return () => clearTimeout(timer)
  }, [])
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!licao) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Lição não encontrada</h1>
          <button
            onClick={() => navigate('/educacao')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar para Educação
          </button>
        </div>
      </div>
    )
  }
  
  const IconeComponente = iconMap[licao.icone] || BookOpen
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Botão Voltar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <button
          onClick={() => navigate('/educacao')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          <span className="font-medium">Voltar para Educação</span>
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header da Lição */}
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${corMap[licao.cor]} rounded-xl flex items-center justify-center`}>
                  <IconeComponente className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    licao.nivel === 'iniciante' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' :
                    licao.nivel === 'intermediario' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300' :
                    'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                  }`}>
                    {licao.nivel.charAt(0).toUpperCase() + licao.nivel.slice(1)}
                  </span>
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {licao.titulo}
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                {licao.resumo}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{licao.tempoLeitura} de leitura</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Categoria: {licao.categoria}</span>
                </div>
                {licaoLida && (
                  <motion.div 
                    className="flex items-center gap-2 text-green-600 dark:text-green-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Lição concluída!</span>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {licao.tags.map((tag, index) => (
              <span key={index} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                #{tag}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Conteúdo da Lição */}
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Introdução */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Introdução</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {licao.conteudo.introducao}
            </p>
          </div>

          {/* Tópicos Principais */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Conteúdo Principal</h2>
            <div className="space-y-6">
              {licao.conteudo.topicos.map((topico, index) => (
                <motion.div 
                  key={index}
                  className="border-l-4 border-blue-500 pl-6 py-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {topico.titulo}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {topico.conteudo}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Seções Específicas por Tipo de Lição */}
          {licao.conteudo.dicasPraticas && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-yellow-500" />
                Dicas Práticas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {licao.conteudo.dicasPraticas.map((dica, index) => (
                  <motion.div 
                    key={index}
                    className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <p className="text-gray-800 dark:text-gray-200 text-sm font-medium">
                      {dica}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {licao.conteudo.calculosInterativos && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-purple-500" />
                Cálculos Interativos
              </h2>
              <div className="space-y-4">
                {licao.conteudo.calculosInterativos.map((calculo, index) => (
                  <div key={index} className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
                      {calculo.titulo}
                    </h4>
                    <p className="text-purple-800 dark:text-purple-200 text-sm">
                      {calculo.exemplo}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {licao.conteudo.exercicioPratico && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Target className="w-6 h-6 text-green-500" />
                Exercício Prático
              </h2>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-300 mb-3">
                  {licao.conteudo.exercicioPratico.titulo}
                </h3>
                <p className="text-green-800 dark:text-green-200 mb-4">
                  {licao.conteudo.exercicioPratico.descricao}
                </p>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Meta de economia:</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {licao.conteudo.exercicioPratico.metaEconomia}
                  </p>
                </div>
              </div>
            </div>
          )}

          {licao.conteudo.errosComuns && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                Erros Comuns a Evitar
              </h2>
              <div className="space-y-3">
                {licao.conteudo.errosComuns.map((erro, index) => (
                  <div key={index} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                    <p className="text-red-800 dark:text-red-200 font-medium">
                      {erro}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conclusão */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Conclusão</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              {licao.conteudo.conclusao}
            </p>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800/30">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Gostou desta lição?
            </h3>
            <p className="text-blue-800 dark:text-blue-300 mb-4">
              Continue aprendendo com mais conteúdos de educação financeira no MoneyMapp.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/educacao')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Ver mais lições
              </button>
              <button
                onClick={() => navigate('/educacao/simuladores')}
                className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700 px-6 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors font-medium"
              >
                Testar simuladores
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}