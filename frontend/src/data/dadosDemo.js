// Dados mockados completos para o modo demonstração
export const dadosDemo = {
  usuario: {
    id: 'demo-user',
    nome: 'Maria Silva',
    email: 'maria.demo@moneymapp.com',
    avatar: null,
    criadoEm: '2024-01-01',
  },

  // Resumo financeiro
  resumo: {
    saldoTotal: 12450.80,
    receitasMes: 8500.00,
    despesasMes: 4250.30,
    economiaMes: 4249.70,
  },

  // Transações detalhadas
  transacoes: [
    { id: 1, tipo: 'receita', descricao: 'Salário Mensal', valor: 5500.00, data: '2024-10-01', categoria: 'Trabalho', status: 'confirmado' },
    { id: 2, tipo: 'receita', descricao: 'Freelance Website', valor: 1200.00, data: '2024-10-02', categoria: 'Trabalho', status: 'confirmado' },
    { id: 3, tipo: 'receita', descricao: 'Venda Online', valor: 450.00, data: '2024-10-03', categoria: 'Vendas', status: 'confirmado' },
    { id: 4, tipo: 'receita', descricao: 'Dividendos', valor: 320.00, data: '2024-10-04', categoria: 'Investimentos', status: 'confirmado' },
    { id: 5, tipo: 'receita', descricao: 'Cashback', valor: 30.00, data: '2024-10-05', categoria: 'Outros', status: 'confirmado' },
    
    { id: 6, tipo: 'despesa', descricao: 'Aluguel', valor: 1200.00, data: '2024-10-05', categoria: 'Moradia', status: 'confirmado' },
    { id: 7, tipo: 'despesa', descricao: 'Supermercado Extra', valor: 320.50, data: '2024-10-02', categoria: 'Alimentação', status: 'confirmado' },
    { id: 8, tipo: 'despesa', descricao: 'Combustível Shell', valor: 180.00, data: '2024-10-03', categoria: 'Transporte', status: 'confirmado' },
    { id: 9, tipo: 'despesa', descricao: 'Internet Fibra', valor: 89.90, data: '2024-10-01', categoria: 'Contas', status: 'confirmado' },
    { id: 10, tipo: 'despesa', descricao: 'Academia', valor: 79.90, data: '2024-10-01', categoria: 'Saúde', status: 'confirmado' },
    { id: 11, tipo: 'despesa', descricao: 'Streaming Netflix', valor: 45.90, data: '2024-10-04', categoria: 'Lazer', status: 'confirmado' },
    { id: 12, tipo: 'despesa', descricao: 'Farmácia', valor: 85.30, data: '2024-10-08', categoria: 'Saúde', status: 'confirmado' },
    { id: 13, tipo: 'despesa', descricao: 'Restaurante', valor: 120.00, data: '2024-10-09', categoria: 'Alimentação', status: 'confirmado' },
    { id: 14, tipo: 'despesa', descricao: 'Uber', valor: 45.80, data: '2024-10-06', categoria: 'Transporte', status: 'confirmado' },
    { id: 15, tipo: 'despesa', descricao: 'Investimento CDB', valor: 1000.00, data: '2024-10-10', categoria: 'Investimentos', status: 'confirmado' },
  ],

  notificacoes: [
    {
      id: 'demo-rec-1',
      title: 'Recorrência executada: Aluguel',
      message: '1 lançamento foi gerado a partir da recorrência "Aluguel". Próxima execução em 2024-11-05.',
      type: 'recurring',
      severity: 'success',
      createdAt: '2024-10-05T12:00:00Z',
      readAt: null,
      metadata: {
        recurringId: 100,
        occurrences: ['2024-10-05'],
        nextRun: '2024-11-05',
        executedCount: 6,
        isActive: true,
      },
    },
    {
      id: 'demo-budget-1',
      title: 'Orçamento de Alimentação em alerta',
      message: 'Você atingiu 85% do limite definido para Alimentação neste mês. Considere revisar seus gastos.',
      type: 'budget',
      severity: 'warning',
      createdAt: '2024-10-08T14:30:00Z',
      readAt: '2024-10-09T08:15:00Z',
      metadata: {
        budgetId: 45,
        percentual: 85,
      },
    },
    {
      id: 'demo-goal-1',
      title: 'Meta concluída: Curso de Inglês',
      message: 'Parabéns! Você atingiu 100% da meta Curso de Inglês e pode registrar uma celebração.',
      type: 'goal',
      severity: 'info',
      createdAt: '2024-09-30T17:45:00Z',
      readAt: '2024-10-01T10:05:00Z',
      metadata: {
        goalId: 3,
        reachedAt: '2024-09-30',
      },
    },
  ],

  // Metas financeiras
  metas: [
    {
      id: 1,
      titulo: 'Notebook para Trabalho',
      descricao: 'Economizar para comprar um notebook profissional',
      valorMeta: 3500.00,
      valorAtual: 2100.00,
      dataInicio: '2024-08-01',
      dataFim: '2024-12-31',
      categoria: 'Tecnologia',
      status: 'ativa',
      cor: '#3B82F6'
    },
    {
      id: 2,
      titulo: 'Viagem de Férias',
      descricao: 'Viajar para a praia nas férias de verão',
      valorMeta: 2500.00,
      valorAtual: 1850.00,
      dataInicio: '2024-06-01',
      dataFim: '2025-01-15',
      categoria: 'Lazer',
      status: 'ativa',
      cor: '#10B981'
    },
    {
      id: 3,
      titulo: 'Reserva de Emergência',
      descricao: 'Criar uma reserva de emergência para 6 meses',
      valorMeta: 15000.00,
      valorAtual: 8200.00,
      dataInicio: '2024-01-01',
      dataFim: '2024-12-31',
      categoria: 'Segurança',
      status: 'ativa',
      cor: '#F59E0B'
    },
    {
      id: 4,
      titulo: 'Curso de Inglês',
      descricao: 'Fazer um curso de inglês completo',
      valorMeta: 1200.00,
      valorAtual: 1200.00,
      dataInicio: '2024-03-01',
      dataFim: '2024-08-30',
      categoria: 'Educação',
      status: 'concluida',
      cor: '#8B5CF6'
    }
  ],

  // Dados para gráficos - Receitas vs Despesas mensais
  receitasVsDespesas: [
    { mes: 'Jun', receitas: 6800, despesas: 3200 },
    { mes: 'Jul', receitas: 7200, despesas: 3800 },
    { mes: 'Ago', receitas: 7800, despesas: 4100 },
    { mes: 'Set', receitas: 8100, despesas: 4000 },
    { mes: 'Out', receitas: 8500, despesas: 4250 },
  ],

  // Gastos por categoria para gráfico pizza
  categorias: [
    { name: 'Moradia', value: 1200, color: '#EF4444', percentual: 28.2 },
    { name: 'Alimentação', value: 440.50, color: '#F59E0B', percentual: 10.4 },
    { name: 'Transporte', value: 225.80, color: '#3B82F6', percentual: 5.3 },
    { name: 'Saúde', value: 165.20, color: '#10B981', percentual: 3.9 },
    { name: 'Lazer', value: 165.90, color: '#8B5CF6', percentual: 3.9 },
    { name: 'Contas', value: 89.90, color: '#6B7280', percentual: 2.1 },
    { name: 'Investimentos', value: 1000.00, color: '#059669', percentual: 23.5 },
    { name: 'Outros', value: 962.00, color: '#D1D5DB', percentual: 22.7 }
  ],

  // Artigos de educação financeira
  artigos: [
    {
      id: 1,
      titulo: 'Como Criar um Orçamento Pessoal Eficiente',
      categoria: 'Orçamento',
      resumo: 'Aprenda a organizar suas finanças e controlar seus gastos mensais.',
      conteudo: `
        Criar um orçamento pessoal é o primeiro passo para o sucesso financeiro...
        
        ## 1. Liste todas as suas fontes de renda
        
        ## 2. Categorize seus gastos
        
        ## 3. Defina metas realistas
      `,
      dataPublicacao: '2024-10-01',
      tempoLeitura: 5,
      autor: 'MoneyMapp Team'
    },
    {
      id: 2,
      titulo: 'Investimentos para Iniciantes: Por Onde Começar',
      categoria: 'Investimentos',
      resumo: 'Guia completo sobre os primeiros passos no mundo dos investimentos.',
      conteudo: `
        Investir pode parecer complexo, mas com conhecimento básico você pode começar...
        
        ## Tipos de investimento para iniciantes
        
        ## Como escolher a corretora
        
        ## Diversificação da carteira
      `,
      dataPublicacao: '2024-09-28',
      tempoLeitura: 8,
      autor: 'MoneyMapp Team'
    }
  ],

  // Configurações do usuário demo
  configuracoes: {
    tema: 'claro',
    idioma: 'pt-BR',
    moeda: 'BRL',
    notificacoes: {
      email: true,
      push: false,
      metas: true,
      transacoes: true
    },
    privacidade: {
      perfilPublico: false,
      compartilharDados: false
    }
  }
}

// Funções utilitárias para manipular dados demo
export const demoUtils = {
  // Calcular progresso de meta
  calcularProgressoMeta: (valorAtual, valorMeta) => {
    return Math.min((valorAtual / valorMeta) * 100, 100)
  },

  // Filtrar transações por período
  filtrarTransacoesPorMes: (transacoes, mes, ano) => {
    return transacoes.filter(t => {
      const data = new Date(t.data)
      return data.getMonth() === mes && data.getFullYear() === ano
    })
  },

  // Calcular total por categoria
  calcularTotalPorCategoria: (transacoes) => {
    const totais = {}
    transacoes.forEach(t => {
      if (t.tipo === 'despesa') {
        totais[t.categoria] = (totais[t.categoria] || 0) + t.valor
      }
    })
    return totais
  },

  // Simular nova transação
  adicionarTransacao: (novaTransacao) => {
    const id = Math.max(...dadosDemo.transacoes.map(t => t.id)) + 1
    return {
      id,
      ...novaTransacao,
      data: new Date().toISOString().split('T')[0],
      status: 'confirmado'
    }
  }
}