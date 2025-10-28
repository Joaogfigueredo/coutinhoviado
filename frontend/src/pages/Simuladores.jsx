import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Calculator, 
  Target, 
  TrendingUp,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Lightbulb,
  AlertCircle
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from 'recharts'
import { calculadoras } from '../data/educacaoMock'

export default function Simuladores() {
  const navigate = useNavigate()
  const [simuladorAtivo, setSimuladorAtivo] = useState('economia')
  
  // Estados do Simulador de Economia
  const [valorMeta, setValorMeta] = useState(10000)
  const [valorMensal, setValorMensal] = useState(500)
  const [rendimentoMensal, setRendimentoMensal] = useState(0.5)
  const [resultadoEconomia, setResultadoEconomia] = useState(null)
  const [dadosGraficoEconomia, setDadosGraficoEconomia] = useState([])
  
  // Estados do Simulador de Comparação
  const [gastoAtual, setGastoAtual] = useState(2500)
  const [metaGasto, setMetaGasto] = useState(2000)
  const [categoria, setCategoria] = useState('Alimentação')
  const [resultadoComparacao, setResultadoComparacao] = useState(null)
  
  const categorias = ['Alimentação', 'Transporte', 'Lazer', 'Moradia', 'Saúde', 'Educação', 'Outros']
  
  // TODO: integrar com backend - salvar simulações do usuário
  useEffect(() => {
    calcularEconomia()
  }, [valorMeta, valorMensal, rendimentoMensal])
  
  useEffect(() => {
    calcularComparacao()
  }, [gastoAtual, metaGasto])
  
  const calcularEconomia = () => {
    const meses = calculadoras.calcularTempoEconomia(valorMeta, valorMensal, rendimentoMensal)
    const dados = calculadoras.gerarGraficoEconomia(valorMeta, valorMensal, rendimentoMensal)
    
    setResultadoEconomia({
      meses,
      anos: Math.floor(meses / 12),
      mesesRestantes: meses % 12,
      totalInvestido: valorMensal * meses,
      rendimentoTotal: valorMeta - (valorMensal * meses)
    })
    
    setDadosGraficoEconomia(dados)
  }
  
  const calcularComparacao = () => {
    const resultado = calculadoras.calcularComparacao(gastoAtual, metaGasto)
    setResultadoComparacao(resultado)
  }
  
  const formatMoney = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }
  
  const dadosGraficoComparacao = [
    { name: 'Seu Gasto', value: gastoAtual, color: resultadoComparacao?.status === 'dentro' ? '#10b981' : '#ef4444' },
    { name: 'Sua Meta', value: metaGasto, color: '#6b7280' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/educacao')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-medium">Voltar para Educação</span>
          </button>
          
          <div className="flex items-center gap-2">
            <Calculator className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Simuladores Financeiros</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Seletor de Simulador */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Escolha um Simulador</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.button
              onClick={() => setSimuladorAtivo('economia')}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                simuladorAtivo === 'economia'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Simulador de Economia</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Quanto tempo para juntar R$X?</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Calcule quanto tempo você levará para atingir sua meta financeira considerando aportes mensais e rendimentos.
              </p>
            </motion.button>

            <motion.button
              onClick={() => setSimuladorAtivo('comparacao')}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                simuladorAtivo === 'comparacao'
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <PieChart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Comparador de Gastos</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Gasto atual vs Meta</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Compare seus gastos mensais com suas metas estabelecidas e veja onde você precisa ajustar.
              </p>
            </motion.button>
          </div>
        </div>

        {/* Simulador de Economia */}
        {simuladorAtivo === 'economia' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Controles */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-500" />
                Configure sua Meta
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Valor que você quer juntar
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="range"
                      min="1000"
                      max="100000"
                      step="1000"
                      value={valorMeta}
                      onChange={(e) => setValorMeta(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span>R$ 1.000</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">{formatMoney(valorMeta)}</span>
                      <span>R$ 100.000</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Valor que você pode guardar por mês
                  </label>
                  <div className="relative">
                    <input
                      type="range"
                      min="100"
                      max="5000"
                      step="50"
                      value={valorMensal}
                      onChange={(e) => setValorMensal(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span>R$ 100</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{formatMoney(valorMensal)}</span>
                      <span>R$ 5.000</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rendimento mensal esperado (%)
                  </label>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={rendimentoMensal}
                      onChange={(e) => setRendimentoMensal(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span>0%</span>
                      <span className="font-semibold text-purple-600 dark:text-purple-400">{rendimentoMensal}% a.m.</span>
                      <span>2%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resultado */}
              {resultadoEconomia && (
                <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-green-200 dark:border-green-700">
                  <h4 className="font-semibold text-green-900 dark:text-green-300 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Resultado da Simulação
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Tempo necessário</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {resultadoEconomia.anos > 0 && `${resultadoEconomia.anos}a `}
                        {resultadoEconomia.mesesRestantes}m
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Total investido</p>
                      <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                        {formatMoney(resultadoEconomia.totalInvestido)}
                      </p>
                    </div>
                  </div>
                  
                  {resultadoEconomia.rendimentoTotal > 0 && (
                    <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Rendimento total:</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {formatMoney(resultadoEconomia.rendimentoTotal)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Gráfico */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                Evolução da Economia
              </h3>
              
              {dadosGraficoEconomia.length > 0 && (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosGraficoEconomia}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                      <XAxis 
                        dataKey="mes" 
                        stroke="#6b7280"
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        tickFormatter={(value) => `R$ ${(value/1000).toFixed(0)}k`}
                      />
                      <Tooltip 
                        formatter={(value) => [formatMoney(value), 'Valor acumulado']}
                        labelFormatter={(label) => `Mês ${label}`}
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="valor" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Dicas */}
              <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Dica:</span>
                </div>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  Para acelerar sua meta, considere aumentar o valor mensal ou buscar investimentos com melhor rentabilidade.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Simulador de Comparação */}
        {simuladorAtivo === 'comparacao' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Controles */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-500" />
                Configure a Comparação
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categoria de Gasto
                  </label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  >
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Seu gasto atual mensal
                  </label>
                  <div className="relative">
                    <input
                      type="range"
                      min="100"
                      max="5000"
                      step="100"
                      value={gastoAtual}
                      onChange={(e) => setGastoAtual(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span>R$ 100</span>
                      <span className="font-semibold text-red-600 dark:text-red-400">{formatMoney(gastoAtual)}</span>
                      <span>R$ 5.000</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sua meta mensal
                  </label>
                  <div className="relative">
                    <input
                      type="range"
                      min="100"
                      max="5000"
                      step="100"
                      value={metaGasto}
                      onChange={(e) => setMetaGasto(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span>R$ 100</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">{formatMoney(metaGasto)}</span>
                      <span>R$ 5.000</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resultado */}
              {resultadoComparacao && (
                <div className={`mt-8 rounded-lg p-6 border ${
                  resultadoComparacao.status === 'dentro'
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700'
                    : 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-700'
                }`}>
                  <h4 className={`font-semibold mb-4 flex items-center gap-2 ${
                    resultadoComparacao.status === 'dentro' ? 'text-green-900 dark:text-green-300' : 'text-red-900 dark:text-red-300'
                  }`}>
                    {resultadoComparacao.status === 'dentro' ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                    Resultado da Comparação
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                      <span className={`font-semibold ${
                        resultadoComparacao.status === 'dentro' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {resultadoComparacao.status === 'dentro' ? '✅ Dentro da meta!' : '❌ Acima da meta'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Percentual da meta:</span>
                      <span className={`font-semibold ${
                        resultadoComparacao.status === 'dentro' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {resultadoComparacao.percentual}%
                      </span>
                    </div>
                    
                    {resultadoComparacao.economia > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Economia mensal:</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {formatMoney(resultadoComparacao.economia)}
                        </span>
                      </div>
                    )}
                    
                    {resultadoComparacao.excesso > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Excesso mensal:</span>
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          {formatMoney(resultadoComparacao.excesso)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Gráfico */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-500" />
                Comparação Visual
              </h3>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosGraficoComparacao} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                    <XAxis 
                      type="number"
                      stroke="#6b7280"
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickFormatter={(value) => formatMoney(value)}
                    />
                    <YAxis 
                      type="category"
                      dataKey="name"
                      stroke="#6b7280"
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      width={100}
                    />
                    <Tooltip 
                      formatter={(value, name) => [formatMoney(value), name]}
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Dicas */}
              <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Dica:</span>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  {resultadoComparacao?.status === 'dentro' 
                    ? 'Parabéns! Você está controlando bem seus gastos nesta categoria.'
                    : 'Considere revisar seus hábitos nesta categoria para voltar à meta.'
                  }
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800/30">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">
            Quer aprender mais sobre planejamento financeiro?
          </h3>
          <p className="text-blue-800 dark:text-blue-300 mb-4">
            Teste seus conhecimentos com nosso quiz educativo ou continue estudando com nossas lições.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/educacao/quiz')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Fazer Quiz
            </button>
            <button
              onClick={() => navigate('/educacao')}
              className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700 px-6 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors font-medium"
            >
              Ver Lições
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}