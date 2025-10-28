import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, BarChart3, BookOpen, User } from 'lucide-react'

const artigosData = {
  1: {
    id: 1,
    titulo: 'Como Criar um Orçamento Pessoal Eficiente',
    categoria: 'orcamento',
    dificuldade: 'Iniciante',
    tempoLeitura: '8 min',
    autor: 'Equipe MoneyMapp',
    dataPublicacao: '15 de setembro de 2024',
    resumo: 'Aprenda a organizar suas finanças com um orçamento personalizado',
    conteudo: `
## Introdução

O orçamento pessoal é a base de uma vida financeira saudável. É através dele que você consegue ter controle sobre seus ganhos e gastos, identificar oportunidades de economia e planejar seus objetivos financeiros.

## 1. Entenda sua Renda Real

O primeiro passo é calcular sua renda líquida mensal, ou seja, o valor que realmente chega na sua conta após os descontos:

- **Salário líquido**: Após descontos de INSS, IR e outros
- **Rendas extras**: Freelances, aluguéis, investimentos
- **Benefícios**: Vale-refeição, vale-transporte

### Dica Importante
Sempre trabalhe com valores conservadores. Se sua renda varia, use a menor estimativa para ter uma margem de segurança.

## 2. Mapeie Todos os Seus Gastos

Liste todos os seus gastos mensais, dividindo-os em categorias:

### Gastos Fixos (50-60% da renda)
- Moradia (aluguel, financiamento, condomínio)
- Alimentação básica
- Transporte
- Seguros obrigatórios
- Planos de saúde

### Gastos Variáveis (20-30% da renda)
- Lazer e entretenimento
- Roupas e acessórios
- Restaurantes e delivery
- Hobbies e cursos

### Reservas e Investimentos (20% da renda)
- Reserva de emergência
- Investimentos de curto prazo
- Aposentadoria privada

## 3. Aplique a Regra 50/30/20

Esta é uma das metodologias mais eficazes para distribuir sua renda:

- **50%**: Necessidades básicas
- **30%**: Desejos e lazer
- **20%**: Poupança e investimentos

## 4. Use Ferramentas Digitais

Aproveite aplicativos e planilhas para automatizar o controle:

- **Apps de controle financeiro**: Para categorizar gastos automaticamente
- **Planilhas**: Para análises mais detalhadas
- **Conta digital**: Para separar diferentes objetivos

## 5. Monitore e Ajuste Regularmente

Seu orçamento deve ser revisado mensalmente:

- Compare o planejado com o realizado
- Identifique desvios e suas causas
- Ajuste as metas conforme necessário
- Celebre quando atingir seus objetivos

## Conclusão

Um orçamento bem estruturado é o primeiro passo para a independência financeira. Comece hoje mesmo, mesmo que de forma simples. O importante é dar o primeiro passo e ir aperfeiçoando ao longo do tempo.

### Próximos Passos
1. Baixe uma planilha de orçamento ou use um app
2. Registre todos os gastos por uma semana
3. Categorize e analise seus padrões de consumo
4. Defina metas realistas para o próximo mês
    `
  },
  2: {
    id: 2,
    titulo: 'Estratégias para Quitar Dívidas Rapidamente',
    categoria: 'dividas',
    dificuldade: 'Intermediário',
    tempoLeitura: '12 min',
    autor: 'Equipe MoneyMapp',
    dataPublicacao: '10 de setembro de 2024',
    resumo: 'Métodos eficazes para se livrar das dívidas e reconquistar a tranquilidade',
    conteudo: `
## Por Que as Dívidas São Perigosas?

As dívidas não controladas podem se transformar rapidamente em uma bola de neve, comprometendo sua qualidade de vida e seus planos futuros. Juros compostos trabalham contra você quando você deve dinheiro.

## 1. Faça um Diagnóstico Completo

Antes de criar um plano, você precisa conhecer exatamente sua situação:

### Liste Todas as Dívidas
- **Cartão de crédito**: Limite usado, juros, parcela mínima
- **Empréstimos**: Valor total, parcelas restantes, taxa de juros
- **Financiamentos**: Saldo devedor, prazo restante
- **Dívidas informais**: Família, amigos, agiotas

### Organize por Prioridade
1. **Dívidas com juros mais altos** (cartão, cheque especial)
2. **Dívidas com garantias** (financiamento imobiliário/veicular)
3. **Dívidas pessoais** (família, amigos)

## 2. Métodos de Quitação

### Método Bola de Neve
Quite primeiro as dívidas menores, independente dos juros:
- **Vantagem**: Motivação psicológica rápida
- **Desvantagem**: Pode pagar mais juros no total

### Método Avalanche
Quite primeiro as dívidas com maiores juros:
- **Vantagem**: Economia máxima de juros
- **Desvantagem**: Pode demorar para ver resultados

### Método Híbrido
Combine os dois métodos baseado na sua personalidade e situação.

## 3. Estratégias de Negociação

### Renegociação com Bancos
- Procure o banco antes de atrasar
- Negocie desconto para pagamento à vista
- Considere portabilidade de dívida
- Use feirões de negociação (Serasa, SPC)

### Dicas de Negociação
- Tenha proposta realista em mãos
- Peça sempre desconto no valor total
- Prefira parcelas que cabem no orçamento
- Tudo por escrito antes de pagar

## 4. Aumente sua Renda Temporariamente

### Renda Extra
- Venda itens que não usa mais
- Trabalhos de fim de semana
- Monetize seus hobbies
- Freelances na sua área

### Corte Gastos Drasticamente
- Cancele assinaturas desnecessárias
- Cozinhe mais em casa
- Use transporte público
- Reavalie planos de celular e internet

## 5. Evite Novas Dívidas

### Mudanças de Comportamento
- Deixe cartão de crédito em casa
- Use apenas dinheiro/débito
- Implemente regra das 24h para compras
- Foque em necessidades, não desejos

### Construa uma Reserva
Mesmo que pequena, tenha uma reserva para emergências e evitar novas dívidas.

## 6. Acompanhe seu Progresso

- Use planilhas ou apps para acompanhar
- Celebre cada dívida quitada
- Mantenha foco no objetivo final
- Considere ajuda profissional se necessário

## Conclusão

Sair das dívidas exige disciplina, planejamento e às vezes sacrifícios temporários. Mas a sensação de liberdade financeira vale todo o esforço investido.

### Plano de Ação
1. Faça o diagnóstico completo hoje
2. Escolha seu método de quitação
3. Negocie as dívidas mais caras
4. Crie fontes de renda extra
5. Monitore o progresso semanalmente
    `
  },
  3: {
    id: 3,
    titulo: 'Construindo sua Reserva de Emergência',
    categoria: 'reserva',
    dificuldade: 'Iniciante',
    tempoLeitura: '10 min',
    autor: 'Equipe MoneyMapp',
    dataPublicacao: '5 de setembro de 2024',
    resumo: 'Como e por que criar uma reserva financeira para imprevistos',
    conteudo: `
## O Que É uma Reserva de Emergência?

A reserva de emergência é um valor guardado especificamente para situações imprevistas como desemprego, problemas de saúde, reparos urgentes ou qualquer situação que afete sua renda ou gere gastos inesperados.

## Por Que É Essencial?

### Tranquilidade Mental
- Reduz stress e ansiedade financeira
- Permite tomar decisões mais racionais
- Evita que você se endivide em emergências

### Liberdade de Escolha
- Possibilidade de mudar de emprego quando necessário
- Tempo para encontrar melhores oportunidades
- Independência para tomar riscos calculados

## Quanto Guardar?

### Para Empregados CLT
**3 a 6 meses** de gastos essenciais
- Maior estabilidade de renda
- Direitos trabalhistas como seguro-desemprego
- Menor volatilidade de receita

### Para Autônomos e Empresários
**6 a 12 meses** de gastos essenciais
- Renda mais volátil
- Sem direitos trabalhistas
- Maior exposição a crises setoriais

### Calcule seus Gastos Essenciais
Inclua apenas o básico para sobreviver:
- Moradia (aluguel, condomínio, luz, água)
- Alimentação básica
- Transporte mínimo
- Seguros obrigatórios
- Medicamentos essenciais

## Onde Guardar sua Reserva?

### Características Essenciais
1. **Liquidez imediata**: Conseguir o dinheiro no mesmo dia
2. **Baixo risco**: Capital protegido da inflação
3. **Facilidade de acesso**: Sem burocracias ou taxas

### Melhores Opções Atualmente

#### Poupança
- **Prós**: Liquidez total, isenta de IR
- **Contras**: Baixa rentabilidade, perde da inflação

#### CDB com Liquidez Diária
- **Prós**: Rentabilidade superior à poupança
- **Contras**: Incidência de IR (decresce com o tempo)

#### Tesouro Selic
- **Prós**: Acompanha a taxa básica de juros
- **Contras**: Taxa de custódia, precisa vender via corretora

#### Conta Remunerada
- **Prós**: Liquidez total, sem taxas
- **Contras**: Rentabilidade variável por instituição

## Como Construir sua Reserva?

### 1. Defina a Meta
- Calcule seus gastos essenciais mensais
- Multiplique pelo número de meses desejado
- Estabeleça prazo realista para atingir

### 2. Automatize o Processo
- Configure débito automático no dia do salário
- Trate como uma conta fixa obrigatória
- Comece com valor pequeno se necessário

### 3. Use Estratégia Progressiva
- **Mês 1-3**: R$ 1.000 (meta mínima)
- **Mês 4-6**: 1 mês de gastos essenciais  
- **Mês 7-12**: 3 meses de gastos essenciais
- **Mês 13+**: Meta final de 6 meses

### 4. Acelere com Extras
- 13º salário
- Restituição do IR
- Bonificações no trabalho
- Vendas de itens não utilizados

## Erros Comuns a Evitar

### Não É para Investimento
- Reserva não é para render muito
- Foque na segurança, não na rentabilidade
- Não aplique em ações, fundos voláteis ou imóveis

### Não Use para Desejos
- Reserva é só para emergências reais
- Não é para viagem dos sonhos
- Não é para trocar de carro

### Não Deixe Parada Sem Rendimento
- Mesmo que pouco, deve render algo
- Inflação corrói o poder de compra
- Busque ao menos acompanhar o CDI

## Quando Usar a Reserva?

### Situações Apropriadas
- Desemprego involuntário
- Problemas graves de saúde
- Reparos essenciais na casa/carro
- Redução significativa de renda

### Como Repor Rapidamente
Após usar a reserva, priorize sua recomposição antes de outros investimentos.

## Conclusão

A reserva de emergência é a base de qualquer planejamento financeiro sólido. Sem ela, você está sempre vulnerável aos imprevistos da vida.

### Ação Imediata
1. Calcule suas despesas essenciais hoje
2. Defina sua meta de reserva
3. Escolha onde guardar o dinheiro
4. Configure o débito automático
5. Acompanhe o progresso mensalmente
    `
  },
  4: {
    id: 4,
    titulo: 'Primeiros Passos em Investimentos',
    categoria: 'investimentos',
    dificuldade: 'Intermediário',
    tempoLeitura: '15 min',
    autor: 'Equipe MoneyMapp',
    dataPublicacao: '1 de setembro de 2024',
    resumo: 'Guia completo para começar a investir com segurança e inteligência',
    conteudo: `
## Por Que Investir?

Investir não é sobre ficar rico rapidamente, mas sobre fazer seu dinheiro trabalhar para você e vencer a inflação ao longo do tempo.

### O Poder dos Juros Compostos
Einstein chamou os juros compostos de "oitava maravilha do mundo". Com eles, você ganha dinheiro não apenas sobre o valor inicial, mas também sobre os rendimentos anteriores.

**Exemplo Prático:**
- R$ 1.000 a 1% ao mês por 12 meses = R$ 1.127
- Mas se reinvestir os ganhos: R$ 1.000 → R$ 1.268

## Antes de Investir: Pré-requisitos

### 1. Quite Dívidas Caras
Não faz sentido investir a 12% ao ano se você paga 15% ao mês no cartão de crédito.

### 2. Tenha Reserva de Emergência
3 a 6 meses de gastos essenciais em aplicações líquidas e seguras.

### 3. Defina Objetivos Claros
- **Curto prazo** (até 2 anos): Viagem, carro
- **Médio prazo** (2 a 10 anos): Casa própria, curso superior
- **Longo prazo** (10+ anos): Aposentadoria, independência financeira

## Conceitos Fundamentais

### Risco vs Retorno
Investimentos mais arriscados tendem a oferecer maiores retornos, mas também maiores chances de perdas.

### Liquidez
Facilidade de transformar o investimento em dinheiro:
- **Alta**: Poupança, CDB com liquidez diária
- **Média**: Tesouro Direto, CDB com vencimento
- **Baixa**: Imóveis, ações sem liquidez

### Diversificação
"Não coloque todos os ovos na mesma cesta". Distribua recursos entre diferentes tipos de investimento.

## Renda Fixa: O Começo Ideal

### Características
- Retorno previsível ou conhecido
- Menor risco
- Ideal para iniciantes e objetivos de curto prazo

### Principais Opções

#### Tesouro Direto
- **Tesouro Selic**: Acompanha a taxa básica de juros
- **Tesouro Prefixado**: Taxa fixa definida na compra
- **Tesouro IPCA+**: Proteção contra inflação + juros reais

#### CDB (Certificado de Depósito Bancário)
- Empréstimo que você faz ao banco
- Garantia do FGC até R$ 250.000
- Rentabilidade varia por banco e prazo

#### LCI/LCA
- Letras de Crédito Imobiliário/Agronegócio
- Isentas de Imposto de Renda
- Garantia do FGC

## Renda Variável: Para Objetivos de Longo Prazo

### Ações
- Você vira sócio de empresas
- Pode gerar dividendos
- Maior potencial de ganho e perda

### Fundos Imobiliários (FIIs)
- Investimento em imóveis sem precisar comprá-los
- Distribuição mensal de rendimentos
- Negociados na bolsa como ações

### ETFs (Exchange Traded Funds)
- Fundos que replicam índices
- Diversificação automática
- Baixas taxas de administração

## Estratégia de Alocação por Idade

### Jovens (20-35 anos)
- **70% Renda Variável**: Ações, FIIs, ETFs
- **30% Renda Fixa**: Emergência e objetivos próximos

### Meia-idade (35-50 anos)
- **50% Renda Variável**
- **50% Renda Fixa**

### Pré-aposentadoria (50+ anos)
- **30% Renda Variável**
- **70% Renda Fixa**

## Como Começar na Prática

### 1. Abra Conta em Corretora
- Compare taxas e serviços
- Grandes bancos vs corretoras independentes
- Verifique se é autorizada pela CVM

### 2. Transfira o Dinheiro
- TED/PIX da sua conta corrente
- Dinheiro fica na conta da corretora
- Não invista de uma vez só

### 3. Faça seu Primeiro Investimento
**Sugestão para iniciantes:**
- 50% Tesouro Selic (liquidez)
- 30% CDB de banco médio (rentabilidade)
- 20% ETF do Ibovespa (renda variável)

### 4. Monitore e Rebalanceie
- Acompanhe mensalmente
- Rebalanceie quando necessário
- Reinvista os rendimentos

## Erros Comuns de Iniciantes

### Querer Ficar Rico Rápido
Investimento é sobre constância, não velocidade.

### Não Diversificar
Não concentre tudo em uma única aplicação.

### Investir por Emoção
Não tome decisões baseadas em medo ou ganância.

### Não Estudar
Invista tempo aprendendo antes de investir dinheiro.

## Tributação dos Investimentos

### Renda Fixa
- **Até 180 dias**: 22,5%
- **181-360 dias**: 20%
- **361-720 dias**: 17,5%
- **Acima de 720 dias**: 15%

### Ações e ETFs
- **15%** sobre ganhos acima de R$ 20.000/mês
- **Day trade**: 20% sobre qualquer ganho

### Isenções
- LCI, LCA, CRI, CRA
- Ações até R$ 20.000 vendidos/mês
- Tesouro Direto (isento para pequenos investidores)

## Conclusão

Investir não precisa ser complicado. Comece simples, seja consistente e vá aprendendo ao longo do caminho. O importante é dar o primeiro passo.

### Seu Plano de Ação
1. Quite dívidas caras e forme reserva de emergência
2. Defina objetivos claros com prazos
3. Abra conta em uma corretora confiável
4. Comece com renda fixa e vá diversificando
5. Estude continuamente e ajuste a estratégia
    `
  }
}

export default function ArtigoDetalhes() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const artigo = artigosData[id]
  
  if (!artigo) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Artigo não encontrado</h1>
        <button
          onClick={() => navigate('/educacao')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Voltar para Educação
        </button>
      </div>
    )
  }

  const formatarConteudo = (texto) => {
    return texto.split('\n').map((linha, index) => {
      if (linha.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-bold text-gray-900 mt-8 mb-4">{linha.replace('## ', '')}</h2>
      }
      if (linha.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-semibold text-gray-800 mt-6 mb-3">{linha.replace('### ', '')}</h3>
      }
      if (linha.startsWith('#### ')) {
        return <h4 key={index} className="text-lg font-medium text-gray-700 mt-4 mb-2">{linha.replace('#### ', '')}</h4>
      }
      if (linha.startsWith('- ')) {
        return <li key={index} className="ml-6 mb-1 text-gray-700">{linha.replace('- ', '')}</li>
      }
      if (linha.trim() === '') {
        return <br key={index} />
      }
      if (linha.includes('**') && linha.includes('**')) {
        const partes = linha.split('**')
        return (
          <p key={index} className="mb-3 text-gray-700 leading-relaxed">
            {partes.map((parte, i) => 
              i % 2 === 1 ? <strong key={i} className="font-semibold text-gray-900">{parte}</strong> : parte
            )}
          </p>
        )
      }
      return <p key={index} className="mb-3 text-gray-700 leading-relaxed">{linha}</p>
    })
  }

  const getCategoryColor = (categoria) => {
    const cores = {
      'orcamento': 'bg-blue-100 text-blue-800',
      'dividas': 'bg-red-100 text-red-800',
      'reserva': 'bg-green-100 text-green-800',
      'investimentos': 'bg-purple-100 text-purple-800'
    }
    return cores[categoria] || 'bg-gray-100 text-gray-800'
  }

  const getDifficultyColor = (dificuldade) => {
    const cores = {
      'Iniciante': 'bg-green-100 text-green-800',
      'Intermediário': 'bg-yellow-100 text-yellow-800',
      'Avançado': 'bg-red-100 text-red-800'
    }
    return cores[dificuldade] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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

      {/* Conteúdo do Artigo */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Imagem de Capa */}
        <div className="mb-8">
          <img 
            src={`https://images.unsplash.com/photo-${artigo.id === 1 ? '1554224154-f72a479e5aa5' : artigo.id === 2 ? '1559526324-4b87b5e36e44' : artigo.id === 3 ? '1579621970563-40767b35a3aa' : '1611974789855-9c2a0a7236a3'}?auto=format&fit=crop&w=1200&h=400&q=80`}
            alt={artigo.titulo}
            className="w-full h-64 md:h-80 object-cover rounded-xl shadow-lg"
          />
        </div>
        
        {/* Header do Artigo */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(artigo.categoria)}`}>
              {artigo.categoria.charAt(0).toUpperCase() + artigo.categoria.slice(1)}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(artigo.dificuldade)}`}>
              {artigo.dificuldade}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {artigo.titulo}
          </h1>
          
          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            {artigo.resumo}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{artigo.autor}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{artigo.tempoLeitura} de leitura</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>{artigo.dataPublicacao}</span>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
          <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-white">
            {formatarConteudo(artigo.conteudo)}
          </article>

          {/* Footer do Artigo */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-600">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800/30">
              <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">
                Gostou deste artigo?
              </h4>
              <p className="text-blue-800 dark:text-blue-300 mb-4">
                Continue aprendendo com mais conteúdos de educação financeira no MoneyMapp.
              </p>
              <button
                onClick={() => navigate('/educacao')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Ver mais artigos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}