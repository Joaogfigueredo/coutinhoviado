// TODO: integrar com backend - dados de educação financeira
export const educacaoMock = {
  licoes: [
    {
      id: 1,
      titulo: "Como economizar na prática",
      categoria: "orcamento",
      nivel: "iniciante",
      tempoLeitura: "8 min",
      resumo: "Estratégias simples e eficazes para reduzir gastos no dia a dia sem abrir mão da qualidade de vida.",
      icone: "piggy-bank",
      cor: "blue",
      tags: ["economia", "dicas", "prático"],
      conteudo: {
        introducao: "Economizar dinheiro não significa viver com privações. É sobre fazer escolhas inteligentes e conscientes que permitam você alcançar seus objetivos financeiros sem sacrificar sua qualidade de vida.",
        topicos: [
          {
            titulo: "1. Revise seus gastos mensais",
            conteudo: "Comece analisando seus últimos 3 meses de gastos. Identifique onde seu dinheiro está indo e categorize tudo: essencial, importante e supérfluo."
          },
          {
            titulo: "2. Aplique a regra dos 30 dias",
            conteudo: "Para compras não essenciais acima de R$ 100, espere 30 dias antes de comprar. Isso elimina 70% das compras por impulso."
          },
          {
            titulo: "3. Negocie suas contas fixas",
            conteudo: "Ligue para operadoras de telefone, internet, seguros e planos. Pergunte sobre promoções e descontos. Uma ligação de 10 minutos pode economizar R$ 50-200/mês."
          },
          {
            titulo: "4. Use a estratégia dos 3 orçamentos",
            conteudo: "Tenha 3 versões do seu orçamento: normal, economia (corta 20% dos gastos) e emergência (corta 40%). Pratique alternando entre eles."
          },
          {
            titulo: "5. Automatize sua economia",
            conteudo: "Configure transferência automática no dia do salário. Se você não vir o dinheiro, não sentirá falta. Comece com 10% da renda."
          }
        ],
        dicasPraticas: [
          "🍽️ Cozinhe em casa 4x por semana (economia: R$ 400/mês)",
          "🚗 Use transporte público 2x por semana (economia: R$ 200/mês)", 
          "📱 Revise planos de celular e streaming (economia: R$ 80/mês)",
          "💡 Troque lâmpadas por LED (economia: R$ 30/mês na conta de luz)",
          "🛒 Faça lista de compras e evite supermercado com fome"
        ],
        exercicioPratico: {
          titulo: "Desafio dos 30 dias",
          descricao: "Escolha uma categoria de gasto (ex: alimentação externa) e reduza 50% por 30 dias. Anote a economia diária.",
          metaEconomia: "R$ 300-500 em um mês"
        },
        conclusao: "Economizar é um hábito que se desenvolve gradualmente. Comece com pequenas mudanças e vá evoluindo. O importante é ser consistente."
      }
    },
    {
      id: 2,
      titulo: "Entendendo juros e dívidas",
      categoria: "dividas",
      nivel: "intermediario", 
      tempoLeitura: "12 min",
      resumo: "Como os juros funcionam, por que as dívidas são perigosas e estratégias para se livrar delas rapidamente.",
      icone: "trending-down",
      cor: "red",
      tags: ["juros", "dívidas", "matemática financeira"],
      conteudo: {
        introducao: "Os juros compostos são chamados de 'oitava maravilha do mundo' - podem trabalhar a seu favor ou contra você. Entender como funcionam é essencial para sua saúde financeira.",
        topicos: [
          {
            titulo: "1. O poder destrutivo dos juros compostos",
            conteudo: "Uma dívida de R$ 1.000 no cartão de crédito (15% ao mês) vira R$ 4.046 em apenas 1 ano se pagar só o mínimo. É matemática, não opinião."
          },
          {
            titulo: "2. Hierarquia das dívidas perigosas",
            conteudo: "1º Cartão de crédito rotativo (15% ao mês), 2º Cheque especial (12% ao mês), 3º Crediário (5% ao mês), 4º Empréstimo pessoal (3% ao mês)."
          },
          {
            titulo: "3. Método Avalanche vs Bola de Neve",
            conteudo: "Avalanche: quite primeiro as dívidas com maior juros (economiza mais dinheiro). Bola de neve: quite primeiro as menores (motivação psicológica)."
          },
          {
            titulo: "4. Negociação inteligente",
            conteudo: "Antes de negociar, saiba exatamente quanto deve, há quanto tempo e qual sua capacidade de pagamento. Proposta realista tem 80% mais chance de ser aceita."
          },
          {
            titulo: "5. Prevenção: nunca mais se endividar",
            conteudo: "Regra de ouro: se não pode pagar à vista, não compre. Use cartão só como meio de pagamento, nunca como empréstimo."
          }
        ],
        calculosInterativos: [
          {
            titulo: "Simulação de dívida no cartão",
            exemplo: "R$ 2.000 a 15% a.m. = R$ 8.091 em 1 ano pagando mínimo"
          },
          {
            titulo: "Economia quitando à vista",
            exemplo: "Desconto de 30% para pagamento à vista = 30% de 'rentabilidade' instantânea"
          }
        ],
        estrategiasQuitacao: [
          "📊 Liste todas as dívidas com valores e juros",
          "💰 Corte gastos supérfluos temporariamente",
          "🔄 Negocie prazo e desconto para pagamento à vista",
          "📈 Use método avalanche para economia máxima",
          "🎯 Comemore cada dívida quitada (motivação)"
        ],
        conclusao: "Dívidas são emergência financeira. Trate com prioridade máxima e nunca subestime o poder dos juros compostos trabalhando contra você."
      }
    },
    {
      id: 3,
      titulo: "Como montar um orçamento pessoal",
      categoria: "orcamento",
      nivel: "iniciante",
      tempoLeitura: "10 min",
      resumo: "Passo a passo completo para criar e manter um orçamento que realmente funciona na prática.",
      icone: "calculator",
      cor: "green",
      tags: ["orçamento", "planejamento", "controle"],
      conteudo: {
        introducao: "Um orçamento não é uma prisão, é um GPS financeiro. Ele mostra onde você está, para onde quer ir e qual caminho seguir.",
        topicos: [
          {
            titulo: "1. Mapeie sua renda real",
            conteudo: "Some TODA a renda líquida: salário, freelances, aluguéis, dividendos. Use sempre valores conservadores para ter margem de segurança."
          },
          {
            titulo: "2. Categorize todos os gastos",
            conteudo: "Fixos obrigatórios (50%): moradia, alimentação básica, transporte. Variáveis (30%): lazer, roupas, restaurantes. Futuro (20%): reserva e investimentos."
          },
          {
            titulo: "3. Use a regra 50/30/20",
            conteudo: "É um guia, não uma lei. Adapte conforme sua realidade. Quem ganha pouco pode usar 60/25/15. Quem ganha muito pode usar 40/30/30."
          },
          {
            titulo: "4. Monitore semanalmente",
            conteudo: "Orçamento que não é acompanhado não funciona. Reserve 15 minutos toda sexta-feira para revisar gastos da semana."
          },
          {
            titulo: "5. Ajuste mensalmente",
            conteudo: "Todo mês compare planejado vs realizado. Identifique desvios, analise causas e ajuste o próximo mês. Orçamento é documento vivo."
          }
        ],
        ferramentsRecomendadas: [
          "📱 Apps: Mobills, Organizze, GuiaBolso",
          "📊 Planilhas: Google Sheets, Excel",
          "💳 Bancos digitais com categorização automática",
          "🏦 Método dos envelopes (físico ou digital)"
        ],
        dicasAvancadas: [
          "🎯 Defina metas específicas para cada categoria",
          "⚡ Automatize transferências para poupança",
          "🔄 Revise e otimize gastos fixos trimestralmente",
          "📈 Aumente % de investimentos conforme renda cresce",
          "🚨 Tenha um 'fundo de emergência' para imprevistos"
        ],
        errosComuns: [
          "❌ Ser muito restritivo (orçamento impossível de seguir)",
          "❌ Não incluir lazer/entretenimento (receita para fracasso)",
          "❌ Esquecer gastos anuais (IPVA, IPTU, seguros)",
          "❌ Não ter categoria 'diversos' para imprevistos",
          "❌ Desistir no primeiro mês de desvio"
        ],
        conclusao: "Orçamento perfeito não existe. O melhor orçamento é aquele que você consegue seguir consistentemente, mesmo que não seja perfeito."
      }
    },
    {
      id: 4,
      titulo: "Começando a investir do zero",
      categoria: "investimentos",
      nivel: "iniciario",
      tempoLeitura: "15 min", 
      resumo: "Guia completo para dar os primeiros passos no mundo dos investimentos com segurança e inteligência.",
      icone: "trending-up",
      cor: "purple",
      tags: ["investimentos", "iniciante", "renda fixa"],
      conteudo: {
        introducao: "Investir não é sobre ficar rico rapidamente, mas sobre fazer seu dinheiro crescer consistentemente e vencer a inflação ao longo do tempo.",
        topicos: [
          {
            titulo: "1. Antes de investir: pré-requisitos",
            conteudo: "✅ Dívidas caras quitadas ✅ Reserva de emergência (3-6 meses) ✅ Objetivos claros definidos ✅ Prazo dos investimentos conhecido"
          },
          {
            titulo: "2. Conceitos fundamentais",
            conteudo: "Risco x Retorno: maior retorno = maior risco. Liquidez: facilidade de resgatar. Diversificação: não colocar tudo numa aplicação só."
          },
          {
            titulo: "3. Primeiro passo: Renda Fixa",
            conteudo: "Comece com Tesouro Direto, CDB ou LCI/LCA. São seguros, previsíveis e ideais para aprender sem estresse."
          },
          {
            titulo: "4. Segundo passo: Renda Variável",
            conteudo: "Depois de 1 ano, considere ações via ETFs (fundos de índice). Comece com 10-20% do patrimônio total."
          },
          {
            titulo: "5. Estratégia por idade",
            conteudo: "20-30 anos: 70% variável, 30% fixa. 30-50 anos: 50% cada. 50+ anos: 70% fixa, 30% variável."
          }
        ],
        passoAPasso: [
          "1️⃣ Abra conta em corretora confiável (XP, Rico, Clear)",
          "2️⃣ Transfira R$ 100-500 para começar",
          "3️⃣ Primeiro investimento: Tesouro Selic",
          "4️⃣ Segundo investimento: CDB de banco médio",
          "5️⃣ Terceiro investimento: LCI/LCA (isento IR)",
          "6️⃣ Estude e diversifique gradualmente"
        ],
        investimentosIniciantes: [
          {
            nome: "Tesouro Selic",
            risco: "Baixíssimo",
            liquidez: "Diária",
            rentabilidade: "100% do CDI",
            indicacao: "Reserva de emergência"
          },
          {
            nome: "CDB",
            risco: "Baixo",
            liquidez: "Varia",
            rentabilidade: "110-130% do CDI",
            indicacao: "Objetivos 1-3 anos"
          },
          {
            nome: "LCI/LCA",
            risco: "Baixo",
            liquidez: "90 dias+",
            rentabilidade: "90-100% do CDI",
            indicacao: "Isento de IR"
          }
        ],
        errosIniciantess: [
          "❌ Querer ficar rico rapidamente",
          "❌ Investir dinheiro que vai precisar em breve",
          "❌ Colocar tudo numa aplicação só",
          "❌ Tomar decisões por emoção (medo/ganância)",
          "❌ Não estudar antes de investir"
        ],
        conclusao: "Investir é uma maratona, não uma corrida de 100m. Comece devagar, seja consistente e vá aprendendo ao longo do caminho."
      }
    }
  ],
  
  simuladores: [
    {
      id: 1,
      titulo: "Simulador de Economia",
      descricao: "Calcule quanto tempo você levará para juntar o valor desejado",
      tipo: "economia",
      parametros: ["valorMeta", "valorMensal", "rendimentoMensal"]
    },
    {
      id: 2, 
      titulo: "Comparador de Gastos",
      descricao: "Compare seus gastos mensais com suas metas estabelecidas",
      tipo: "comparacao",
      parametros: ["gastoAtual", "metaGasto", "categoria"]
    }
  ],
  
  quiz: {
    titulo: "Quiz: Qual seu nível de educação financeira?",
    descricao: "Teste seus conhecimentos em 5 perguntas e descubra onde você está na jornada financeira",
    perguntas: [
      {
        id: 1,
        pergunta: "Qual a primeira coisa que você deve fazer com seu salário?",
        opcoes: [
          { id: "a", texto: "Pagar todas as contas", pontos: 2 },
          { id: "b", texto: "Guardar 10-20% para reserva/investimentos", pontos: 5 },
          { id: "c", texto: "Aproveitar para comprar coisas que quero", pontos: 1 },
          { id: "d", texto: "Pagar o mínimo das contas e guardar o resto", pontos: 3 }
        ]
      },
      {
        id: 2,
        pergunta: "Você tem uma dívida no cartão de R$ 1.000 cobrando 15% ao mês. Qual a melhor estratégia?",
        opcoes: [
          { id: "a", texto: "Pagar o mínimo e investir o resto na poupança (0,5% ao mês)", pontos: 1 },
          { id: "b", texto: "Cortar gastos e quitar a dívida o mais rápido possível", pontos: 5 },
          { id: "c", texto: "Fazer outro empréstimo com juros menores para quitar", pontos: 3 },
          { id: "d", texto: "Negociar um desconto para pagamento parcelado", pontos: 2 }
        ]
      },
      {
        id: 3,
        pergunta: "Qual o valor ideal para sua reserva de emergência?",
        opcoes: [
          { id: "a", texto: "1 mês dos seus gastos essenciais", pontos: 2 },
          { id: "b", texto: "3-6 meses dos seus gastos essenciais", pontos: 5 },
          { id: "c", texto: "R$ 10.000 independente da renda", pontos: 1 },
          { id: "d", texto: "Não preciso, tenho cartão de crédito", pontos: 0 }
        ]
      },
      {
        id: 4,
        pergunta: "Qual investimento é mais adequado para quem está começando?",
        opcoes: [
          { id: "a", texto: "Ações de empresas promissoras", pontos: 1 },
          { id: "b", texto: "Tesouro Direto e CDB", pontos: 5 },
          { id: "c", texto: "Fundos de investimento do banco", pontos: 2 },
          { id: "d", texto: "Bitcoin e criptomoedas", pontos: 0 }
        ]
      },
      {
        id: 5,
        pergunta: "Como você controla seus gastos mensais?",
        opcoes: [
          { id: "a", texto: "Não controlo, vejo o saldo no final do mês", pontos: 0 },
          { id: "b", texto: "Anoto alguns gastos importantes", pontos: 2 },
          { id: "c", texto: "Uso planilha ou app para categorizar tudo", pontos: 5 },
          { id: "d", texto: "Controlo mentalmente", pontos: 1 }
        ]
      }
    ],
    resultados: [
      {
        pontuacaoMin: 0,
        pontuacaoMax: 8,
        titulo: "🚨 Atenção: Precisa urgente de educação financeira",
        descricao: "Seus hábitos financeiros podem estar comprometendo seu futuro. É hora de começar a estudar e mudar comportamentos.",
        dicas: [
          "Comece controlando gastos com apps ou planilhas",
          "Quite dívidas caras imediatamente", 
          "Monte uma reserva de emergência",
          "Estude sobre educação financeira 30min/dia"
        ]
      },
      {
        pontuacaoMin: 9,
        pontuacaoMax: 15,
        titulo: "⚠️ No caminho: Alguns conhecimentos, mas pode melhorar",
        descricao: "Você tem noções básicas, mas ainda comete alguns erros que podem custar caro no longo prazo.",
        dicas: [
          "Aprimore seu controle de gastos",
          "Aprenda sobre investimentos básicos",
          "Desenvolva disciplina para poupar",
          "Estude estratégias de quitação de dívidas"
        ]
      },
      {
        pontuacaoMin: 16,
        pontuacaoMax: 20,
        titulo: "💰 Parabéns: Você tem boa educação financeira!",
        descricao: "Seus conhecimentos estão acima da média. Continue assim e foque em otimizar seus investimentos.",
        dicas: [
          "Diversifique seus investimentos",
          "Estude renda variável com cautela",
          "Ensine outros sobre educação financeira",
          "Continue estudando para manter-se atualizado"
        ]
      },
      {
        pontuacaoMin: 21,
        pontuacaoMax: 25,
        titulo: "🏆 Expert: Você é referência em educação financeira!",
        descricao: "Parabéns! Você domina os conceitos fundamentais e tem disciplina financeira exemplar.",
        dicas: [
          "Considere estratégias avançadas de investimento",
          "Ajude amigos e família com educação financeira",
          "Continue estudando mercado financeiro",
          "Considere criar conteúdo educativo"
        ]
      }
    ]
  }
}

// TODO: integrar com backend - funções para cálculos dos simuladores
export const calculadoras = {
  // Simulador 1: Tempo para juntar valor
  calcularTempoEconomia: (valorMeta, valorMensal, rendimentoMensal = 0) => {
    if (valorMensal <= 0) return null
    
    if (rendimentoMensal === 0) {
      return Math.ceil(valorMeta / valorMensal)
    }
    
    // Fórmula de juros compostos
    const taxa = rendimentoMensal / 100
    const meses = Math.log(1 + (valorMeta * taxa) / valorMensal) / Math.log(1 + taxa)
    return Math.ceil(meses)
  },
  
  // Simulador 2: Comparação gastos vs meta
  calcularComparacao: (gastoAtual, metaGasto) => {
    const diferenca = gastoAtual - metaGasto
    const percentual = ((gastoAtual / metaGasto) * 100).toFixed(1)
    
    return {
      diferenca,
      percentual,
      status: diferenca <= 0 ? 'dentro' : 'acima',
      economia: diferenca <= 0 ? Math.abs(diferenca) : 0,
      excesso: diferenca > 0 ? diferenca : 0
    }
  },
  
  // Geração de dados para gráficos
  gerarGraficoEconomia: (valorMeta, valorMensal, rendimentoMensal = 0) => {
    const meses = calculadoras.calcularTempoEconomia(valorMeta, valorMensal, rendimentoMensal)
    if (!meses) return []
    
    const dados = []
    let acumulado = 0
    
    for (let i = 1; i <= meses; i++) {
      acumulado = acumulado * (1 + rendimentoMensal / 100) + valorMensal
      dados.push({
        mes: i,
        valor: Math.min(acumulado, valorMeta),
        meta: valorMeta
      })
    }
    
    return dados
  }
}