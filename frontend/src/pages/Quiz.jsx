import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Brain, 
  CheckCircle,
  XCircle,
  RefreshCw,
  Trophy,
  AlertTriangle,
  TrendingUp,
  Lightbulb,
  Target,
  Clock
} from 'lucide-react'
import { educacaoMock } from '../data/educacaoMock'

export default function Quiz() {
  const navigate = useNavigate()
  const [perguntaAtual, setPerguntaAtual] = useState(0)
  const [respostas, setRespostas] = useState({})
  const [quizFinalizado, setQuizFinalizado] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [respondendo, setRespondendo] = useState(false)
  
  const quiz = educacaoMock.quiz
  const pergunta = quiz.perguntas[perguntaAtual]
  const totalPerguntas = quiz.perguntas.length
  const progresso = ((perguntaAtual + 1) / totalPerguntas) * 100
  
  const responderPergunta = (opcaoId) => {
    if (respondendo) return
    
    setRespondendo(true)
    const novasRespostas = {
      ...respostas,
      [perguntaAtual]: opcaoId
    }
    setRespostas(novasRespostas)
    
    // Delay para mostrar feedback visual
    setTimeout(() => {
      if (perguntaAtual < totalPerguntas - 1) {
        setPerguntaAtual(perguntaAtual + 1)
        setRespondendo(false)
      } else {
        finalizarQuiz(novasRespostas)
      }
    }, 1000)
  }
  
  const finalizarQuiz = (respostasFinais) => {
    // TODO: integrar com backend - salvar resultado do quiz
    let pontuacaoTotal = 0
    
    quiz.perguntas.forEach((pergunta, index) => {
      const respostaSelecionada = respostasFinais[index]
      const opcaoSelecionada = pergunta.opcoes.find(op => op.id === respostaSelecionada)
      if (opcaoSelecionada) {
        pontuacaoTotal += opcaoSelecionada.pontos
      }
    })
    
    const resultadoEncontrado = quiz.resultados.find(r => 
      pontuacaoTotal >= r.pontuacaoMin && pontuacaoTotal <= r.pontuacaoMax
    )
    
    setResultado({
      pontuacao: pontuacaoTotal,
      maxPontuacao: quiz.perguntas.reduce((acc, p) => acc + Math.max(...p.opcoes.map(o => o.pontos)), 0),
      percentual: Math.round((pontuacaoTotal / 25) * 100),
      ...resultadoEncontrado
    })
    
    setQuizFinalizado(true)
    setRespondendo(false)
  }
  
  const reiniciarQuiz = () => {
    setPerguntaAtual(0)
    setRespostas({})
    setQuizFinalizado(false)
    setResultado(null)
    setRespondendo(false)
  }
  
  const getIconeResultado = (titulo) => {
    if (titulo.includes('Expert') || titulo.includes('Parabéns')) return Trophy
    if (titulo.includes('Atenção')) return AlertTriangle
    if (titulo.includes('caminho')) return TrendingUp
    return Target
  }
  
  const getCorResultado = (titulo) => {
    if (titulo.includes('Expert') || titulo.includes('Parabéns')) return 'from-green-500 to-emerald-500'
    if (titulo.includes('Atenção')) return 'from-red-500 to-pink-500'
    if (titulo.includes('caminho')) return 'from-yellow-500 to-orange-500'
    return 'from-blue-500 to-purple-500'
  }

  if (quizFinalizado && resultado) {
    const IconeResultado = getIconeResultado(resultado.titulo)
    const corResultado = getCorResultado(resultado.titulo)
    
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Header */}
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
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center"
          >
            {/* Ícone e título */}
            <div className="mb-8">
              <div className={`w-20 h-20 bg-gradient-to-br ${corResultado} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <IconeResultado className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Quiz Finalizado!
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Veja seu resultado abaixo
              </p>
            </div>

            {/* Pontuação */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-center gap-8 mb-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sua pontuação</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {resultado.pontuacao}/{resultado.maxPontuacao}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Percentual</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {resultado.percentual}%
                  </p>
                </div>
              </div>
              
              {/* Barra de progresso */}
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                <motion.div 
                  className={`h-3 bg-gradient-to-r ${corResultado} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${resultado.percentual}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>

            {/* Resultado */}
            <div className={`bg-gradient-to-r ${corResultado.replace('500', '50').replace('dark:bg-', 'dark:from-').replace('900/20', '900/20')} dark:from-gray-900/20 dark:to-gray-900/20 rounded-xl p-6 mb-8 text-left border border-opacity-20`}>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {resultado.titulo}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {resultado.descricao}
              </p>
              
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Próximos passos recomendados:
                </h3>
                <ul className="space-y-2">
                  {resultado.dicas.map((dica, index) => (
                    <motion.li 
                      key={index}
                      className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{dica}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Ações */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={reiniciarQuiz}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <RefreshCw className="w-5 h-5" />
                Refazer Quiz
              </button>
              <button
                onClick={() => navigate('/educacao')}
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Continuar Estudando
              </button>
              <button
                onClick={() => navigate('/educacao/simuladores')}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Usar Simuladores
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <button
            onClick={() => navigate('/educacao')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-medium text-sm sm:text-base">Voltar para Educação</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg">
              <Clock className="w-4 h-4" />
              <span>Pergunta {perguntaAtual + 1} de {totalPerguntas}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header do Quiz */}
        {perguntaAtual === 0 && !respondendo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 mb-8 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {quiz.titulo}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {quiz.descricao}
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 <strong>Dica:</strong> Responda com honestidade para obter um resultado mais preciso sobre seu nível de educação financeira.
              </p>
            </div>
          </motion.div>
        )}

        {/* Barra de Progresso */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progresso</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{Math.round(progresso)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div 
              className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progresso}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Pergunta */}
        <AnimatePresence mode="wait">
          <motion.div
            key={perguntaAtual}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8"
          >
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {perguntaAtual + 1}
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Pergunta {perguntaAtual + 1}
                </h2>
              </div>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                {pergunta.pergunta}
              </p>
            </div>

            {/* Opções */}
            <div className="space-y-4">
              {pergunta.opcoes.map((opcao, index) => (
                <motion.button
                  key={opcao.id}
                  onClick={() => responderPergunta(opcao.id)}
                  disabled={respondendo}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-300 ${
                    respostas[perguntaAtual] === opcao.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  } ${respondendo ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={!respondendo ? { scale: 1.02 } : {}}
                  whileTap={!respondendo ? { scale: 0.98 } : {}}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      respostas[perguntaAtual] === opcao.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {respostas[perguntaAtual] === opcao.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <CheckCircle className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white mr-2">
                      {opcao.id.toUpperCase()})
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {opcao.texto}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Loading de resposta */}
            {respondendo && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 text-center"
              >
                <div className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <RefreshCw className="w-5 h-5" />
                  </motion.div>
                  <span>Processando resposta...</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}