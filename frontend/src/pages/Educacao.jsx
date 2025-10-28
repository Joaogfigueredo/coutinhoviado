import React, { useState, useEffect } from 'react'
import { BookOpen, Download, FileText, TrendingUp, PiggyBank, Shield, Target, CreditCard, Heart, GraduationCap, Sparkles, X, Maximize2, Minimize2, ChevronLeft, ChevronRight, Play, CheckCircle, Award } from 'lucide-react'

// Conteúdo completo dos eBooks (em HTML para melhor formatação)
const ebooksConteudo = {
  1: {
    paginas: [
      {
        titulo: 'Introdução ao Planejamento Financeiro',
        conteudo: `
          <p class="mb-4">O planejamento financeiro pessoal é a base para uma vida financeira saudável e equilibrada. Ele permite que você tome controle do seu dinheiro, ao invés de deixá-lo controlar você.</p>
          <p class="mb-4"><strong>Por que é importante?</strong></p>
          <ul class="list-disc pl-6 mb-4 space-y-2">
            <li>Evita gastos desnecessários e desperdícios</li>
            <li>Ajuda a alcançar objetivos financeiros</li>
            <li>Reduz o estresse relacionado a dinheiro</li>
            <li>Prepara você para emergências</li>
            <li>Permite construir patrimônio ao longo do tempo</li>
          </ul>
          <div class="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 my-4">
            <p class="font-semibold text-blue-900 dark:text-blue-200">💡 Dica Importante:</p>
            <p class="text-blue-800 dark:text-blue-300">Um bom planejamento financeiro não significa deixar de aproveitar a vida, mas sim fazer escolhas conscientes que permitam realizar seus sonhos sem comprometer seu futuro.</p>
          </div>
        `
      },
      {
        titulo: 'Passo 1: Conheça Sua Situação Atual',
        conteudo: `
          <p class="mb-4">Antes de planejar para onde quer ir, você precisa saber onde está. Este é o primeiro e mais importante passo.</p>
          <p class="mb-4"><strong>Como fazer um diagnóstico financeiro:</strong></p>
          <ol class="list-decimal pl-6 mb-4 space-y-3">
            <li><strong>Liste todas as suas receitas:</strong> Salário, rendas extras, aluguéis, investimentos, etc.</li>
            <li><strong>Registre todas as despesas:</strong> Fixas (aluguel, luz, internet) e variáveis (alimentação, lazer, transporte).</li>
            <li><strong>Identifique suas dívidas:</strong> Cartão de crédito, empréstimos, financiamentos, com juros e prazos.</li>
            <li><strong>Avalie seus ativos:</strong> Investimentos, imóveis, veículos, reserva de emergência.</li>
          </ol>
          <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 my-4">
            <p class="font-semibold mb-2">📊 Ferramentas úteis:</p>
            <ul class="list-disc pl-6 space-y-1 text-sm">
              <li>Aplicativos de controle financeiro (como o MoneyMap!)</li>
              <li>Planilhas de Excel ou Google Sheets</li>
              <li>Extratos bancários e de cartão</li>
              <li>Caderno de anotações diárias</li>
            </ul>
          </div>
        `
      },
      {
        titulo: 'Passo 2: Crie Seu Orçamento',
        conteudo: `
          <p class="mb-4">Com sua situação financeira mapeada, é hora de criar um orçamento realista e equilibrado.</p>
          <p class="mb-4"><strong>A Regra 50/30/20:</strong></p>
          <div class="space-y-4 my-4">
            <div class="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4">
              <p class="font-bold text-green-900 dark:text-green-200">50% - Necessidades Essenciais</p>
              <p class="text-sm text-green-800 dark:text-green-300">Moradia, alimentação, transporte, saúde, contas básicas</p>
            </div>
            <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4">
              <p class="font-bold text-yellow-900 dark:text-yellow-200">30% - Desejos e Qualidade de Vida</p>
              <p class="text-sm text-yellow-800 dark:text-yellow-300">Lazer, restaurantes, hobbies, assinaturas, compras</p>
            </div>
            <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4">
              <p class="font-bold text-blue-900 dark:text-blue-200">20% - Poupança e Investimentos</p>
              <p class="text-sm text-blue-800 dark:text-blue-300">Reserva de emergência, investimentos, objetivos futuros</p>
            </div>
          </div>
          <p class="text-sm italic text-gray-600 dark:text-gray-400 mt-4">* Estas porcentagens são um guia. Ajuste conforme sua realidade, mas sempre priorize a poupança!</p>
        `
      },
      {
        titulo: 'Passo 3: Elimine Desperdícios',
        conteudo: `
          <p class="mb-4">Pequenos gastos diários podem representar grandes valores ao longo do mês. Identifique e reduza desperdícios:</p>
          <div class="space-y-3 my-4">
            <div class="flex items-start gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <span class="text-2xl">☕</span>
              <div>
                <p class="font-semibold">Cafés e lanchinhos</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">R$ 10/dia = R$ 300/mês. Prepare em casa e economize R$ 200!</p>
              </div>
            </div>
            <div class="flex items-start gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <span class="text-2xl">📺</span>
              <div>
                <p class="font-semibold">Assinaturas não utilizadas</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Cancele streamings, apps e serviços que você não usa regularmente.</p>
              </div>
            </div>
            <div class="flex items-start gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <span class="text-2xl">🚗</span>
              <div>
                <p class="font-semibold">Transporte desnecessário</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Considere caronas, transporte público ou até caminhar para trajetos curtos.</p>
              </div>
            </div>
            <div class="flex items-start gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <span class="text-2xl">💡</span>
              <div>
                <p class="font-semibold">Energia e água</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Pequenas mudanças de hábito podem reduzir suas contas em até 30%.</p>
              </div>
            </div>
          </div>
        `
      },
      {
        titulo: 'Mantendo o Planejamento',
        conteudo: `
          <p class="mb-4">Um planejamento financeiro só funciona se for mantido e revisado regularmente. Aqui estão as melhores práticas:</p>
          <div class="space-y-4 my-4">
            <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <p class="font-bold text-purple-900 dark:text-purple-200 mb-2">📅 Revisão Mensal</p>
              <p class="text-sm text-purple-800 dark:text-purple-300">Compare seus gastos reais com o planejado. Ajuste o orçamento quando necessário.</p>
            </div>
            <div class="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <p class="font-bold text-orange-900 dark:text-orange-200 mb-2">🎯 Defina Metas Claras</p>
              <p class="text-sm text-orange-800 dark:text-orange-300">Ter objetivos específicos (viagem, carro, casa) mantém você motivado.</p>
            </div>
            <div class="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4">
              <p class="font-bold text-teal-900 dark:text-teal-200 mb-2">🔄 Automatize Poupanças</p>
              <p class="text-sm text-teal-800 dark:text-teal-300">Configure transferências automáticas para poupança logo após receber o salário.</p>
            </div>
            <div class="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4">
              <p class="font-bold text-pink-900 dark:text-pink-200 mb-2">👨‍👩‍👧‍👦 Envolva a Família</p>
              <p class="text-sm text-pink-800 dark:text-pink-300">Quando todos participam, fica mais fácil manter o compromisso financeiro.</p>
            </div>
          </div>
          <div class="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-6 my-6 text-center">
            <p class="text-2xl font-bold mb-2">🎉 Parabéns!</p>
            <p>Você deu o primeiro passo rumo à sua independência financeira. Continue firme no seu planejamento!</p>
          </div>
        `
      }
    ]
  },
  2: {
    paginas: [
      {
        titulo: 'O que é Reserva de Emergência?',
        conteudo: `
          <p class="mb-4">A reserva de emergência é um valor guardado exclusivamente para situações imprevistas e urgentes. É o seu colchão de segurança financeira.</p>
          <div class="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 my-4">
            <p class="font-semibold text-red-900 dark:text-red-200">⚠️ Situações de Emergência:</p>
            <ul class="list-disc pl-6 mt-2 space-y-1 text-red-800 dark:text-red-300">
              <li>Perda de emprego ou redução de renda</li>
              <li>Problemas de saúde inesperados</li>
              <li>Reparos urgentes (carro, casa, aparelhos)</li>
              <li>Despesas com familiares</li>
              <li>Oportunidades inadiáveis</li>
            </ul>
          </div>
          <p class="mb-4"><strong>Por que é essencial?</strong></p>
          <ul class="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Segurança:</strong> Protege você de endividamento em crises</li>
            <li><strong>Tranquilidade:</strong> Reduz ansiedade e estresse financeiro</li>
            <li><strong>Liberdade:</strong> Permite tomar decisões sem desespero</li>
            <li><strong>Oportunidades:</strong> Estar preparado abre portas</li>
          </ul>
        `
      },
      {
        titulo: 'Quanto Guardar?',
        conteudo: `
          <p class="mb-4">O valor ideal da reserva de emergência varia de acordo com seu perfil e estabilidade:</p>
          <div class="space-y-4 my-6">
            <div class="border-2 border-green-500 bg-green-50 dark:bg-green-900/20 rounded-xl p-5">
              <p class="text-xl font-bold text-green-900 dark:text-green-200 mb-2">👨‍💼 Funcionário CLT</p>
              <p class="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">3 a 6 meses</p>
              <p class="text-sm text-green-800 dark:text-green-300">de despesas essenciais mensais</p>
            </div>
            <div class="border-2 border-orange-500 bg-orange-50 dark:bg-orange-900/20 rounded-xl p-5">
              <p class="text-xl font-bold text-orange-900 dark:text-orange-200 mb-2">💼 Autônomo/Freelancer</p>
              <p class="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">6 a 12 meses</p>
              <p class="text-sm text-orange-800 dark:text-orange-300">de despesas essenciais mensais</p>
            </div>
            <div class="border-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20 rounded-xl p-5">
              <p class="text-xl font-bold text-purple-900 dark:text-purple-200 mb-2">🏢 Empresário</p>
              <p class="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">12+ meses</p>
              <p class="text-sm text-purple-800 dark:text-purple-300">de despesas essenciais mensais</p>
            </div>
          </div>
          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 my-4">
            <p class="font-semibold text-blue-900 dark:text-blue-200 mb-2">📝 Como calcular:</p>
            <p class="text-blue-800 dark:text-blue-300 text-sm">Some todas as suas despesas ESSENCIAIS mensais (aluguel, alimentação, contas, transporte, saúde) e multiplique pelo número de meses recomendado para seu perfil.</p>
          </div>
        `
      },
      {
        titulo: 'Onde Guardar a Reserva?',
        conteudo: `
          <p class="mb-4">A reserva de emergência deve estar em investimentos com 3 características principais:</p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            <div class="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-blue-500">
              <div class="text-4xl mb-2">💧</div>
              <p class="font-bold text-blue-900 dark:text-blue-200">LIQUIDEZ</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Resgate imediato quando precisar</p>
            </div>
            <div class="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-green-500">
              <div class="text-4xl mb-2">🛡️</div>
              <p class="font-bold text-green-900 dark:text-green-200">SEGURANÇA</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Baixo risco de perda do capital</p>
            </div>
            <div class="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-purple-500">
              <div class="text-4xl mb-2">📈</div>
              <p class="font-bold text-purple-900 dark:text-purple-200">RENDIMENTO</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Pelo menos acompanha a inflação</p>
            </div>
          </div>
          <p class="mb-4"><strong>Melhores opções:</strong></p>
          <ul class="space-y-3">
            <li class="flex items-start gap-3 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <span class="text-2xl">✅</span>
              <div>
                <p class="font-semibold text-green-900 dark:text-green-200">Tesouro Selic</p>
                <p class="text-sm text-green-800 dark:text-green-300">Liquidez diária, seguro (governo) e bom rendimento</p>
              </div>
            </li>
            <li class="flex items-start gap-3 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <span class="text-2xl">✅</span>
              <div>
                <p class="font-semibold text-green-900 dark:text-green-200">CDB com Liquidez Diária</p>
                <p class="text-sm text-green-800 dark:text-green-300">Protegido pelo FGC até R$ 250 mil</p>
              </div>
            </li>
            <li class="flex items-start gap-3 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <span class="text-2xl">✅</span>
              <div>
                <p class="font-semibold text-green-900 dark:text-green-200">Fundos de Renda Fixa</p>
                <p class="text-sm text-green-800 dark:text-green-300">Com liquidez D+0 ou D+1</p>
              </div>
            </li>
          </ul>
        `
      },
      {
        titulo: 'Como Construir Sua Reserva',
        conteudo: `
          <p class="mb-4">Construir uma reserva de emergência exige disciplina e método. Siga este plano:</p>
          <div class="space-y-4 my-6">
            <div class="flex items-start gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-blue-500">
              <div class="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
              <div>
                <p class="font-bold mb-1">Calcule o valor total necessário</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Use a fórmula: Despesas Essenciais × Meses recomendados</p>
              </div>
            </div>
            <div class="flex items-start gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-purple-500">
              <div class="flex-shrink-0 w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
              <div>
                <p class="font-bold mb-1">Defina um valor mensal fixo</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Mesmo que pequeno, o importante é a constância</p>
              </div>
            </div>
            <div class="flex items-start gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-green-500">
              <div class="flex-shrink-0 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
              <div>
                <p class="font-bold mb-1">Automatize a transferência</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Configure débito automático logo após receber o salário</p>
              </div>
            </div>
            <div class="flex items-start gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-orange-500">
              <div class="flex-shrink-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">4</div>
              <div>
                <p class="font-bold mb-1">Direcione rendas extras</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">13º salário, bônus, freelances → direto para a reserva</p>
              </div>
            </div>
            <div class="flex items-start gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-red-500">
              <div class="flex-shrink-0 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center font-bold">5</div>
              <div>
                <p class="font-bold mb-1">Não mexa até completar</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Considere "intocável" até atingir o valor total</p>
              </div>
            </div>
          </div>
        `
      },
      {
        titulo: 'Quando Usar a Reserva',
        conteudo: `
          <p class="mb-4">A reserva de emergência NÃO deve ser usada para qualquer imprevisto. Saiba quando usar:</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
            <div class="space-y-3">
              <h3 class="font-bold text-green-600 dark:text-green-400 text-lg flex items-center gap-2">
                <span class="text-2xl">✅</span> PODE USAR
              </h3>
              <ul class="space-y-2">
                <li class="flex items-start gap-2 text-sm">
                  <span class="text-green-500">●</span>
                  <span>Perda de emprego</span>
                </li>
                <li class="flex items-start gap-2 text-sm">
                  <span class="text-green-500">●</span>
                  <span>Problema de saúde grave</span>
                </li>
                <li class="flex items-start gap-2 text-sm">
                  <span class="text-green-500">●</span>
                  <span>Reparo essencial (vazamento, geladeira quebrada)</span>
                </li>
                <li class="flex items-start gap-2 text-sm">
                  <span class="text-green-500">●</span>
                  <span>Morte na família</span>
                </li>
                <li class="flex items-start gap-2 text-sm">
                  <span class="text-green-500">●</span>
                  <span>Desastre natural</span>
                </li>
              </ul>
            </div>
            <div class="space-y-3">
              <h3 class="font-bold text-red-600 dark:text-red-400 text-lg flex items-center gap-2">
                <span class="text-2xl">❌</span> NÃO PODE USAR
              </h3>
              <ul class="space-y-2">
                <li class="flex items-start gap-2 text-sm">
                  <span class="text-red-500">●</span>
                  <span>Viagens de férias</span>
                </li>
                <li class="flex items-start gap-2 text-sm">
                  <span class="text-red-500">●</span>
                  <span>Comprar celular/eletrônico novo</span>
                </li>
                <li class="flex items-start gap-2 text-sm">
                  <span class="text-red-500">●</span>
                  <span>Presentes e festas</span>
                </li>
                <li class="flex items-start gap-2 text-sm">
                  <span class="text-red-500">●</span>
                  <span>Promoções e liquidações</span>
                </li>
                <li class="flex items-start gap-2 text-sm">
                  <span class="text-red-500">●</span>
                  <span>Investimentos ou negócios</span>
                </li>
              </ul>
            </div>
          </div>
          <div class="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg p-6 my-6 text-center">
            <p class="text-2xl font-bold mb-2">🎯 Meta Alcançada!</p>
            <p class="mb-4">Após completar sua reserva de emergência, você estará protegido e poderá focar em investimentos de longo prazo.</p>
            <p class="text-sm opacity-90">Lembre-se: reponha a reserva sempre que precisar usá-la!</p>
          </div>
        `
      }
    ]
  },
  3: {
    paginas: [
      {
        titulo: 'Introdução aos Investimentos',
        conteudo: `
          <p class="mb-4">Investir é fazer seu dinheiro trabalhar para você. É essencial para construir patrimônio e alcançar seus objetivos financeiros de longo prazo.</p>
          <div class="bg-gradient-to-r from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg p-6 my-6">
            <p class="text-2xl font-bold mb-3 text-purple-900 dark:text-purple-200">Por que investir?</p>
            <ul class="space-y-2 text-purple-800 dark:text-purple-300">
              <li>💰 <strong>Crescimento do Patrimônio:</strong> Seu dinheiro rende ao longo do tempo</li>
              <li>🛡️ <strong>Proteção contra Inflação:</strong> Mantém seu poder de compra</li>
              <li>🎯 <strong>Realização de Sonhos:</strong> Casa própria, viagens, aposentadoria</li>
              <li>🔓 <strong>Liberdade Financeira:</strong> Viver de renda no futuro</li>
            </ul>
          </div>
        `
      },
      {
        titulo: 'Renda Fixa',
        conteudo: `
          <p class="mb-4">Na renda fixa, você sabe (ou tem uma boa previsibilidade) quanto vai receber no vencimento. É mais segura e previsível.</p>
          <div class="space-y-4 my-6">
            <div class="border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-5">
              <p class="text-xl font-bold text-blue-900 dark:text-blue-200 mb-2">🏛️ Tesouro Direto</p>
              <p class="text-sm mb-3 text-blue-800 dark:text-blue-300">Títulos públicos do governo federal. O investimento mais seguro do Brasil.</p>
              <div class="text-sm space-y-1 text-blue-700 dark:text-blue-400">
                <p>• <strong>Tesouro Selic:</strong> Liquidez diária, acompanha a taxa Selic</p>
                <p>• <strong>Tesouro Prefixado:</strong> Taxa fixa definida no momento da compra</p>
                <p>• <strong>Tesouro IPCA+:</strong> Protege da inflação + juros reais</p>
              </div>
            </div>
            <div class="border-2 border-green-500 bg-green-50 dark:bg-green-900/20 rounded-lg p-5">
              <p class="text-xl font-bold text-green-900 dark:text-green-200 mb-2">🏦 CDB (Certificado de Depósito Bancário)</p>
              <p class="text-sm mb-3 text-green-800 dark:text-green-300">Você empresta dinheiro para o banco e recebe juros.</p>
              <div class="text-sm space-y-1 text-green-700 dark:text-green-400">
                <p>• Garantido pelo FGC até R$ 250 mil por CPF/instituição</p>
                <p>• Rentabilidade geralmente acima da poupança</p>
                <p>• Pode ter liquidez diária ou prazos definidos</p>
              </div>
            </div>
            <div class="border-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-5">
              <p class="text-xl font-bold text-purple-900 dark:text-purple-200 mb-2">📄 LCI e LCA</p>
              <p class="text-sm mb-3 text-purple-800 dark:text-purple-300">Letras de Crédito Imobiliário e do Agronegócio - isentas de IR!</p>
              <div class="text-sm space-y-1 text-purple-700 dark:text-purple-400">
                <p>• Não pagam Imposto de Renda</p>
                <p>• Também protegidos pelo FGC</p>
                <p>• Geralmente com prazos mais longos</p>
              </div>
            </div>
          </div>
        `
      },
      {
        titulo: 'Renda Variável',
        conteudo: `
          <p class="mb-4">Na renda variável, os ganhos não são previsíveis. Maior risco, mas também maior potencial de retorno no longo prazo.</p>
          <div class="space-y-4 my-6">
            <div class="border-2 border-orange-500 bg-orange-50 dark:bg-orange-900/20 rounded-lg p-5">
              <p class="text-xl font-bold text-orange-900 dark:text-orange-200 mb-2">📈 Ações</p>
              <p class="text-sm mb-3 text-orange-800 dark:text-orange-300">Você se torna sócio de empresas negociadas na Bolsa de Valores.</p>
              <div class="text-sm space-y-1 text-orange-700 dark:text-orange-400">
                <p>• Valorização do preço da ação</p>
                <p>• Recebimento de dividendos (parte dos lucros)</p>
                <p>• Alta volatilidade (oscilações de preço)</p>
                <p>• Recomendado para longo prazo (5+ anos)</p>
              </div>
            </div>
            <div class="border-2 border-pink-500 bg-pink-50 dark:bg-pink-900/20 rounded-lg p-5">
              <p class="text-xl font-bold text-pink-900 dark:text-pink-200 mb-2">🏢 Fundos Imobiliários (FIIs)</p>
              <p class="text-sm mb-3 text-pink-800 dark:text-pink-300">Invista em imóveis sem precisar comprar um imóvel inteiro.</p>
              <div class="text-sm space-y-1 text-pink-700 dark:text-pink-400">
                <p>• Rendimento mensal (aluguéis distribuídos)</p>
                <p>• Isenção de IR sobre dividendos para pessoa física</p>
                <p>• Diversificação em shoppings, escritórios, galpões</p>
                <p>• Alta liquidez (fácil comprar e vender)</p>
              </div>
            </div>
            <div class="border-2 border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-5">
              <p class="text-xl font-bold text-cyan-900 dark:text-cyan-200 mb-2">💼 ETFs</p>
              <p class="text-sm mb-3 text-cyan-800 dark:text-cyan-300">Fundos que replicam índices da bolsa. Diversificação automática!</p>
              <div class="text-sm space-y-1 text-cyan-700 dark:text-cyan-400">
                <p>• Um único ETF pode conter dezenas de ações</p>
                <p>• Taxas de administração baixas</p>
                <p>• Ideal para quem está começando em ações</p>
              </div>
            </div>
          </div>
        `
      },
      {
        titulo: 'Montando Sua Carteira',
        conteudo: `
          <p class="mb-4">Uma carteira diversificada equilibra risco e retorno. Não coloque todos os ovos na mesma cesta!</p>
          <div class="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl p-6 my-6">
            <p class="text-xl font-bold mb-4 text-indigo-900 dark:text-indigo-200">📊 Exemplo de Alocação por Perfil:</p>
            <div class="space-y-4">
              <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
                <p class="font-bold text-green-600 mb-2">🟢 Conservador (baixo risco)</p>
                <p class="text-sm">80% Renda Fixa | 20% Renda Variável</p>
              </div>
              <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
                <p class="font-bold text-yellow-600 mb-2">🟡 Moderado (risco equilibrado)</p>
                <p class="text-sm">50% Renda Fixa | 50% Renda Variável</p>
              </div>
              <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
                <p class="font-bold text-red-600 mb-2">🔴 Arrojado (alto risco)</p>
                <p class="text-sm">20% Renda Fixa | 80% Renda Variável</p>
              </div>
            </div>
          </div>
          <div class="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 my-4">
            <p class="font-semibold text-yellow-900 dark:text-yellow-200">⚠️ Regras de Ouro:</p>
            <ol class="list-decimal pl-6 mt-2 space-y-1 text-sm text-yellow-800 dark:text-yellow-300">
              <li>Nunca invista dinheiro que você pode precisar em menos de 1 ano em renda variável</li>
              <li>Diversifique entre diferentes ativos e setores</li>
              <li>Rebalanceie sua carteira periodicamente</li>
              <li>Invista regularmente (aportes mensais)</li>
              <li>Pense no longo prazo - não venda no primeiro sinal de queda</li>
            </ol>
          </div>
        `
      },
      {
        titulo: 'Primeiros Passos',
        conteudo: `
          <p class="mb-4">Pronto para começar? Siga este guia passo a passo:</p>
          <div class="space-y-4 my-6">
            <div class="flex items-start gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-blue-500">
              <div class="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
              <div>
                <p class="font-bold mb-1">Tenha sua reserva de emergência completa</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Nunca invista antes de ter seu colchão de segurança</p>
              </div>
            </div>
            <div class="flex items-start gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-purple-500">
              <div class="flex-shrink-0 w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
              <div>
                <p class="font-bold mb-1">Abra conta em uma corretora</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Pesquise taxas, plataforma e atendimento. Muitas são gratuitas!</p>
              </div>
            </div>
            <div class="flex items-start gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-green-500">
              <div class="flex-shrink-0 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
              <div>
                <p class="font-bold mb-1">Comece pequeno</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">R$ 100, R$ 50 ou até R$ 30 já é um começo. O importante é começar!</p>
              </div>
            </div>
            <div class="flex items-start gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-orange-500">
              <div class="flex-shrink-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">4</div>
              <div>
                <p class="font-bold mb-1">Estude antes de investir</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Entenda onde está colocando seu dinheiro. Não siga dicas de terceiros cegamente.</p>
              </div>
            </div>
            <div class="flex items-start gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-red-500">
              <div class="flex-shrink-0 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center font-bold">5</div>
              <div>
                <p class="font-bold mb-1">Seja consistente</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Aportes mensais regulares são mais importantes que grandes valores esporádicos</p>
              </div>
            </div>
          </div>
          <div class="bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-lg p-6 my-6 text-center">
            <p class="text-2xl font-bold mb-2">🚀 Você está pronto!</p>
            <p class="mb-2">O melhor momento para começar a investir foi há 10 anos.</p>
            <p class="font-bold text-xl">O segundo melhor momento é AGORA!</p>
          </div>
        `
      }
    ]
  },
  4: {
    paginas: [
      {
        titulo: 'O que é Consumo Consciente?',
        conteudo: `
          <p class="mb-4">Consumo consciente é fazer escolhas de compra pensando no impacto financeiro, ambiental e social. É consumir com propósito e responsabilidade.</p>
          <div class="bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 rounded-lg p-6 my-6">
            <p class="text-2xl font-bold mb-3 text-pink-900 dark:text-pink-200">Por que praticar?</p>
            <ul class="space-y-2 text-pink-800 dark:text-pink-300">
              <li>💰 <strong>Economia:</strong> Gaste menos comprando apenas o necessário</li>
              <li>🌱 <strong>Sustentabilidade:</strong> Reduza desperdício e impacto ambiental</li>
              <li>😌 <strong>Bem-estar:</strong> Menos ansiedade por consumo</li>
              <li>🎯 <strong>Foco:</strong> Direcione recursos para o que realmente importa</li>
            </ul>
          </div>
          <div class="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 my-4">
            <p class="font-semibold text-yellow-900 dark:text-yellow-200">💡 Reflexão:</p>
            <p class="text-yellow-800 dark:text-yellow-300 italic">"Será que eu realmente preciso disso, ou apenas quero momentaneamente?"</p>
          </div>
        `
      },
      {
        titulo: 'Necessidade vs Desejo',
        conteudo: `
          <p class="mb-4">Diferenciar necessidade de desejo é fundamental para o consumo consciente e saúde financeira.</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
            <div class="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border-2 border-green-500">
              <p class="text-xl font-bold text-green-900 dark:text-green-200 mb-4 flex items-center gap-2">
                <span class="text-2xl">✅</span> NECESSIDADES
              </p>
              <p class="text-sm mb-3 text-green-800 dark:text-green-300">Essenciais para sobrevivência e dignidade básica:</p>
              <ul class="space-y-2 text-sm">
                <li class="flex items-start gap-2">
                  <span class="text-green-500">●</span>
                  <span>Alimentação saudável</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-green-500">●</span>
                  <span>Moradia adequada</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-green-500">●</span>
                  <span>Vestuário básico</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-green-500">●</span>
                  <span>Saúde e higiene</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-green-500">●</span>
                  <span>Transporte para trabalho/estudo</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-green-500">●</span>
                  <span>Educação básica</span>
                </li>
              </ul>
            </div>
            <div class="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6 border-2 border-orange-500">
              <p class="text-xl font-bold text-orange-900 dark:text-orange-200 mb-4 flex items-center gap-2">
                <span class="text-2xl">💭</span> DESEJOS
              </p>
              <p class="text-sm mb-3 text-orange-800 dark:text-orange-300">Agregam prazer e conforto, mas não são essenciais:</p>
              <ul class="space-y-2 text-sm">
                <li class="flex items-start gap-2">
                  <span class="text-orange-500">●</span>
                  <span>Restaurantes e delivery</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-orange-500">●</span>
                  <span>Roupas de marca</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-orange-500">●</span>
                  <span>Eletrônicos de última geração</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-orange-500">●</span>
                  <span>Streamings múltiplos</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-orange-500">●</span>
                  <span>Viagens de lazer frequentes</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-orange-500">●</span>
                  <span>Decoração e itens supérfluos</span>
                </li>
              </ul>
            </div>
          </div>
          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 my-4">
            <p class="font-semibold text-blue-900 dark:text-blue-200 mb-2">🎯 Regra Prática:</p>
            <p class="text-blue-800 dark:text-blue-300 text-sm">Necessidade: "O que acontece se eu NÃO comprar?" Se a resposta for grave (fome, frio, doença), é necessidade. Se for apenas desconforto ou desejo, é um "quero".</p>
          </div>
        `
      },
      {
        titulo: 'Técnicas para Evitar Compras por Impulso',
        conteudo: `
          <p class="mb-4">Compras por impulso são o maior inimigo do orçamento. Use estas técnicas comprovadas:</p>
          <div class="space-y-4 my-6">
            <div class="bg-white dark:bg-gray-800 rounded-lg p-5 border-l-4 border-purple-500">
              <p class="font-bold text-lg mb-2 text-purple-900 dark:text-purple-200">⏰ Regra das 24 Horas</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Antes de comprar algo não planejado, espere 24 horas. Se ainda quiser após esse período, avalie novamente. Para compras acima de R$ 500, espere 7 dias.</p>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg p-5 border-l-4 border-green-500">
              <p class="font-bold text-lg mb-2 text-green-900 dark:text-green-200">📝 Lista de Compras Sempre</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Nunca vá ao mercado ou shopping sem uma lista definida. Compre APENAS o que está na lista. Isso evita 70% das compras desnecessárias.</p>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg p-5 border-l-4 border-blue-500">
              <p class="font-bold text-lg mb-2 text-blue-900 dark:text-blue-200">🚫 Descadastre de E-mails Promocionais</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Menos tentação = menos gastos. Cancele newsletters de lojas e desinstale apps de e-commerce do celular.</p>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg p-5 border-l-4 border-orange-500">
              <p class="font-bold text-lg mb-2 text-orange-900 dark:text-orange-200">💳 Deixe o Cartão em Casa</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Leve apenas o dinheiro necessário para compras planejadas. Dificultar o pagamento reduz compras impulsivas.</p>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg p-5 border-l-4 border-pink-500">
              <p class="font-bold text-lg mb-2 text-pink-900 dark:text-pink-200">🤔 Pergunte-se: "Horas de Trabalho"</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Converta o preço em horas de trabalho. "Vale 8 horas do meu trabalho esse tênis?" Isso traz perspectiva real do custo.</p>
            </div>
          </div>
        `
      },
      {
        titulo: 'Consumo Sustentável',
        conteudo: `
          <p class="mb-4">Consumir conscientemente também significa pensar no impacto ambiental e social das suas escolhas.</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <p class="font-bold text-green-900 dark:text-green-200 mb-2">♻️ Reduza e Reutilize</p>
              <ul class="text-sm space-y-1 text-green-800 dark:text-green-300">
                <li>• Compre produtos duráveis, não descartáveis</li>
                <li>• Conserte ao invés de jogar fora</li>
                <li>• Use garrafas e sacolas reutilizáveis</li>
                <li>• Doe o que não usa mais</li>
              </ul>
            </div>
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p class="font-bold text-blue-900 dark:text-blue-200 mb-2">🛒 Compre Consciente</p>
              <ul class="text-sm space-y-1 text-blue-800 dark:text-blue-300">
                <li>• Prefira produtos locais</li>
                <li>• Escolha embalagens recicláveis</li>
                <li>• Apoie pequenos produtores</li>
                <li>• Verifique certificações éticas</li>
              </ul>
            </div>
            <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <p class="font-bold text-purple-900 dark:text-purple-200 mb-2">💡 Economia Circular</p>
              <ul class="text-sm space-y-1 text-purple-800 dark:text-purple-300">
                <li>• Compre em brechós e segunda mão</li>
                <li>• Alugue ao invés de comprar</li>
                <li>• Participe de trocas e feiras</li>
                <li>• Venda o que não usa mais</li>
              </ul>
            </div>
            <div class="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <p class="font-bold text-orange-900 dark:text-orange-200 mb-2">🌱 Menos é Mais</p>
              <ul class="text-sm space-y-1 text-orange-800 dark:text-orange-300">
                <li>• Minimalismo traz paz e economia</li>
                <li>• Qualidade sobre quantidade</li>
                <li>• Experiências > Coisas materiais</li>
                <li>• Valorize o que já tem</li>
              </ul>
            </div>
          </div>
        `
      },
      {
        titulo: 'Desafio do Consumo Consciente',
        conteudo: `
          <p class="mb-4">Que tal colocar em prática? Experimente estes desafios por 30 dias:</p>
          <div class="space-y-3 my-6">
            <div class="flex items-start gap-3 bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20 p-4 rounded-lg">
              <span class="text-3xl">1️⃣</span>
              <div>
                <p class="font-bold text-pink-900 dark:text-pink-200">Desafio Zero Compras</p>
                <p class="text-sm text-pink-800 dark:text-pink-300">30 dias comprando APENAS necessidades básicas (alimentos, remédios, transporte). Nada de roupas, eletrônicos, decoração, etc.</p>
              </div>
            </div>
            <div class="flex items-start gap-3 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg">
              <span class="text-3xl">2️⃣</span>
              <div>
                <p class="font-bold text-blue-900 dark:text-blue-200">Desafio do Diário de Gastos</p>
                <p class="text-sm text-blue-800 dark:text-blue-300">Anote TODOS os gastos, por menores que sejam. Ao final do mês, classifique cada um como "necessário" ou "impulsivo".</p>
              </div>
            </div>
            <div class="flex items-start gap-3 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg">
              <span class="text-3xl">3️⃣</span>
              <div>
                <p class="font-bold text-green-900 dark:text-green-200">Desafio 1 Item Por Dia</p>
                <p class="text-sm text-green-800 dark:text-green-300">A cada dia, doe, venda ou descarte 1 item que você não usa. Em 30 dias, terá 30 itens a menos e espaço/dinheiro a mais!</p>
              </div>
            </div>
          </div>
          <div class="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg p-6 my-6 text-center">
            <p class="text-2xl font-bold mb-2">💪 Você Consegue!</p>
            <p class="mb-2">Consumo consciente é uma jornada, não um destino.</p>
            <p class="text-sm opacity-90">Cada pequena escolha faz diferença no seu bolso e no planeta!</p>
          </div>
        `
      }
    ]
  },
  5: {
    paginas: [
      {
        titulo: 'Crédito: Aliado ou Vilão?',
        conteudo: `
          <p class="mb-4">O crédito em si não é bom nem mau. Tudo depende de COMO você o utiliza. Pode ser uma ferramenta poderosa ou uma armadilha financeira.</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
            <div class="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border-2 border-green-500">
              <p class="text-xl font-bold text-green-900 dark:text-green-200 mb-4 flex items-center gap-2">
                <span class="text-2xl">✅</span> USO INTELIGENTE
              </p>
              <ul class="space-y-2 text-sm text-green-800 dark:text-green-300">
                <li class="flex items-start gap-2">
                  <span class="text-green-500">●</span>
                  <span>Emergências médicas inadiáveis</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-green-500">●</span>
                  <span>Investir em educação/capacitação</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-green-500">●</span>
                  <span>Aproveitar descontos à vista</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-green-500">●</span>
                  <span>Construir histórico de crédito</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-green-500">●</span>
                  <span>Consolidar dívidas caras</span>
                </li>
              </ul>
            </div>
            <div class="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border-2 border-red-500">
              <p class="text-xl font-bold text-red-900 dark:text-red-200 mb-4 flex items-center gap-2">
                <span class="text-2xl">❌</span> USO PERIGOSO
              </p>
              <ul class="space-y-2 text-sm text-red-800 dark:text-red-300">
                <li class="flex items-start gap-2">
                  <span class="text-red-500">●</span>
                  <span>Comprar supérfluos que não pode pagar</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-red-500">●</span>
                  <span>Pagar apenas o mínimo do cartão</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-red-500">●</span>
                  <span>Entrar no cheque especial</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-red-500">●</span>
                  <span>Fazer crédito consignado para gastar</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-red-500">●</span>
                  <span>Empréstimo para pagar outro empréstimo</span>
                </li>
              </ul>
            </div>
          </div>
        `
      },
      {
        titulo: 'Cartão de Crédito: Regras de Ouro',
        conteudo: `
          <p class="mb-4">O cartão de crédito é uma das ferramentas financeiras mais úteis, mas também uma das mais perigosas se mal utilizada.</p>
          <div class="space-y-4 my-6">
            <div class="bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-6">
              <p class="text-2xl font-bold mb-4 text-orange-900 dark:text-orange-200">📋 10 Mandamentos do Cartão de Crédito:</p>
              <ol class="space-y-3">
                <li class="flex items-start gap-3">
                  <span class="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <p class="text-sm"><strong>Pague SEMPRE o valor total da fatura</strong> - Nunca o mínimo!</p>
                </li>
                <li class="flex items-start gap-3">
                  <span class="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <p class="text-sm"><strong>Gaste no máximo 30% do limite</strong> - Isso protege seu score</p>
                </li>
                <li class="flex items-start gap-3">
                  <span class="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <p class="text-sm"><strong>Configure alertas de gastos</strong> - Mantenha controle em tempo real</p>
                </li>
                <li class="flex items-start gap-3">
                  <span class="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  <p class="text-sm"><strong>Nunca parcele no rotativo</strong> - Os juros são ALTÍSSIMOS (300%+ ao ano)</p>
                </li>
                <li class="flex items-start gap-3">
                  <span class="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
                  <p class="text-sm"><strong>Recuse anuidade</strong> - Existem ótimos cartões sem anuidade</p>
                </li>
                <li class="flex items-start gap-3">
                  <span class="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">6</span>
                  <p class="text-sm"><strong>Cuidado com parcelamentos longos</strong> - Máximo 3x sem juros</p>
                </li>
                <li class="flex items-start gap-3">
                  <span class="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">7</span>
                  <p class="text-sm"><strong>Revise a fatura mensalmente</strong> - Identifique cobranças indevidas</p>
                </li>
                <li class="flex items-start gap-3">
                  <span class="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">8</span>
                  <p class="text-sm"><strong>Cancele assinaturas esquecidas</strong> - Aquele streaming que você não usa?</p>
                </li>
                <li class="flex items-start gap-3">
                  <span class="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">9</span>
                  <p class="text-sm"><strong>Use benefícios (pontos, milhas)</strong> - Mas não gaste mais por causa deles</p>
                </li>
                <li class="flex items-start gap-3">
                  <span class="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">10</span>
                  <p class="text-sm"><strong>Se não consegue controlar, NÃO USE</strong> - É melhor usar débito</p>
                </li>
              </ol>
            </div>
          </div>
        `
      },
      {
        titulo: 'Tipos de Crédito e Juros',
        conteudo: `
          <p class="mb-4">Nem todo crédito é igual. Conheça os tipos e seus juros médios (dados de 2024):</p>
          <div class="space-y-3 my-6">
            <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-l-4 border-green-500">
              <div class="flex justify-between items-start mb-2">
                <p class="font-bold text-green-900 dark:text-green-200">🏦 Crédito Consignado</p>
                <span class="text-sm font-bold text-green-600">1-2% ao mês</span>
              </div>
              <p class="text-sm text-green-800 dark:text-green-300">Desconto direto na folha de pagamento. Menor taxa do mercado, mas compromete renda futura.</p>
            </div>
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-l-4 border-blue-500">
              <div class="flex justify-between items-start mb-2">
                <p class="font-bold text-blue-900 dark:text-blue-200">🏠 Financiamento Imobiliário</p>
                <span class="text-sm font-bold text-blue-600">0,7-1% ao mês</span>
              </div>
              <p class="text-sm text-blue-800 dark:text-blue-300">Taxas baixas, mas compromisso de longo prazo (até 35 anos). Bem garantido pelo imóvel.</p>
            </div>
            <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border-l-4 border-yellow-500">
              <div class="flex justify-between items-start mb-2">
                <p class="font-bold text-yellow-900 dark:text-yellow-200">💳 Cartão Parcelado sem juros</p>
                <span class="text-sm font-bold text-yellow-600">0% oficial</span>
              </div>
              <p class="text-sm text-yellow-800 dark:text-yellow-300">Parece gratuito, mas loja já embutiu no preço. Negociando à vista pode conseguir desconto.</p>
            </div>
            <div class="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border-l-4 border-orange-500">
              <div class="flex justify-between items-start mb-2">
                <p class="font-bold text-orange-900 dark:text-orange-200">🏧 Empréstimo Pessoal</p>
                <span class="text-sm font-bold text-orange-600">3-8% ao mês</span>
              </div>
              <p class="text-sm text-orange-800 dark:text-orange-300">Taxa média-alta. Compare entre bancos antes de fechar. Prefira bancos digitais.</p>
            </div>
            <div class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border-l-4 border-red-500">
              <div class="flex justify-between items-start mb-2">
                <p class="font-bold text-red-900 dark:text-red-200">💳 Rotativo do Cartão</p>
                <span class="text-sm font-bold text-red-600">15%+ ao mês</span>
              </div>
              <p class="text-sm text-red-800 dark:text-red-300">EVITE A TODO CUSTO! Pode chegar a 400% ao ano. É a pior opção de crédito do Brasil.</p>
            </div>
            <div class="bg-red-100 dark:bg-red-900/30 rounded-lg p-4 border-l-4 border-red-600">
              <div class="flex justify-between items-start mb-2">
                <p class="font-bold text-red-900 dark:text-red-200">⚠️ Cheque Especial</p>
                <span class="text-sm font-bold text-red-600">8-12% ao mês</span>
              </div>
              <p class="text-sm text-red-800 dark:text-red-300">Segundo pior crédito. Use apenas emergências de 1-2 dias. Jamais fique no negativo por semanas.</p>
            </div>
          </div>
        `
      },
      {
        titulo: 'Como Sair do Endividamento',
        conteudo: `
          <p class="mb-4">Se você já está endividado, não entre em pânico. Há saída! Siga este plano:</p>
          <div class="space-y-4 my-6">
            <div class="bg-white dark:bg-gray-800 rounded-lg p-5 border-l-4 border-blue-500">
              <p class="font-bold text-lg mb-2 text-blue-900 dark:text-blue-200">1️⃣ Pare de Criar Novas Dívidas</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Corte todos os cartões, cancele créditos, viva com o que tem. Primeiro estancar a sangria!</p>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg p-5 border-l-4 border-purple-500">
              <p class="font-bold text-lg mb-2 text-purple-900 dark:text-purple-200">2️⃣ Liste Todas as Dívidas</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Anote: credor, valor total, juros, parcela mínima. Conhecer o inimigo é o primeiro passo.</p>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg p-5 border-l-4 border-green-500">
              <p class="font-bold text-lg mb-2 text-green-900 dark:text-green-200">3️⃣ Negocie TUDO</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Bancos preferem receber menos que não receber nada. Peça descontos de 50-70%, parcelamento sem juros, entrada menor. SEMPRE negocie!</p>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg p-5 border-l-4 border-orange-500">
              <p class="font-bold text-lg mb-2 text-orange-900 dark:text-orange-200">4️⃣ Priorize por Juros (Avalanche)</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Pague primeiro as dívidas com maiores juros (cartão, cheque especial). Mantenha mínimo das outras.</p>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg p-5 border-l-4 border-red-500">
              <p class="font-bold text-lg mb-2 text-red-900 dark:text-red-200">5️⃣ Aumente Renda Temporariamente</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Freelances, vendas de itens, bicos. Todo extra vai DIRETO para dívidas. Sacrifício temporário para liberdade.</p>
            </div>
          </div>
          <div class="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 my-4">
            <p class="font-semibold text-green-900 dark:text-green-200">✨ Importante:</p>
            <p class="text-green-800 dark:text-green-300 text-sm">Após quitar, comemore, mas não relaxe! Use esse "espaço" no orçamento para criar sua reserva de emergência e nunca mais voltar para dívidas.</p>
          </div>
        `
      },
      {
        titulo: 'Construindo Crédito Saudável',
        conteudo: `
          <p class="mb-4">Após limpar as dívidas (ou se nunca teve), construa um histórico de crédito positivo:</p>
          <div class="space-y-3 my-6">
            <div class="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <span class="text-2xl">💳</span>
              <div>
                <p class="font-semibold text-blue-900 dark:text-blue-200">Use cartão com responsabilidade</p>
                <p class="text-sm text-blue-800 dark:text-blue-300">Pequenos gastos mensais + pagamento total = score em alta</p>
              </div>
            </div>
            <div class="flex items-start gap-3 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <span class="text-2xl">📅</span>
              <div>
                <p class="font-semibold text-green-900 dark:text-green-200">Pague tudo em dia</p>
                <p class="text-sm text-green-800 dark:text-green-300">Contas, financiamentos, aluguel. Histórico limpo = crédito fácil e barato no futuro</p>
              </div>
            </div>
            <div class="flex items-start gap-3 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <span class="text-2xl">📊</span>
              <div>
                <p class="font-semibold text-purple-900 dark:text-purple-200">Monitore seu score</p>
                <p class="text-sm text-purple-800 dark:text-purple-300">Serasa, Boa Vista, Quod. Acompanhe e corrija erros. Score alto = juros menores</p>
              </div>
            </div>
            <div class="flex items-start gap-3 bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <span class="text-2xl">🎯</span>
              <div>
                <p class="font-semibold text-orange-900 dark:text-orange-200">Mantenha relacionamento bancário</p>
                <p class="text-sm text-orange-800 dark:text-orange-300">Conta antiga, movimentação regular = ofertas melhores de crédito</p>
              </div>
            </div>
          </div>
          <div class="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg p-6 my-6 text-center">
            <p class="text-2xl font-bold mb-2">🎓 Lembre-se:</p>
            <p class="mb-2">Crédito é uma ferramenta, não uma extensão da sua renda.</p>
            <p class="font-bold text-lg">Use com sabedoria e colha os benefícios!</p>
          </div>
        `
      }
    ]
  },
  6: {
    paginas: [
      {
        titulo: 'O Poder das Metas Financeiras',
        conteudo: `
          <p class="mb-4">Metas financeiras transformam sonhos vagos em objetivos concretos e alcançáveis. Elas dão propósito ao seu planejamento financeiro.</p>
          <div class="bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-lg p-6 my-6">
            <p class="text-2xl font-bold mb-3 text-cyan-900 dark:text-cyan-200">Por que definir metas?</p>
            <ul class="space-y-2 text-cyan-800 dark:text-cyan-300">
              <li>🎯 <strong>Direção Clara:</strong> Você sabe onde quer chegar</li>
              <li>💪 <strong>Motivação Diária:</strong> Razão concreta para economizar</li>
              <li>📈 <strong>Progresso Visível:</strong> Acompanha quanto falta</li>
              <li>🎉 <strong>Satisfação:</strong> Prazer em conquistar o que planejou</li>
              <li>⚖️ <strong>Equilíbrio:</strong> Evita sacrifícios exagerados ou gastos sem rumo</li>
            </ul>
          </div>
          <div class="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 my-4">
            <p class="font-semibold text-yellow-900 dark:text-yellow-200">💡 Fato Curioso:</p>
            <p class="text-yellow-800 dark:text-yellow-300">Estudos mostram que pessoas com metas financeiras escritas têm 42% mais chances de alcançá-las do que quem apenas "pensa" nelas.</p>
          </div>
        `
      },
      {
        titulo: 'Classificação de Metas',
        conteudo: `
          <p class="mb-4">Metas financeiras podem ser classificadas por prazo. Cada tipo exige uma estratégia diferente:</p>
          <div class="space-y-4 my-6">
            <div class="border-2 border-green-500 bg-green-50 dark:bg-green-900/20 rounded-xl p-5">
              <p class="text-xl font-bold text-green-900 dark:text-green-200 mb-3">🏃 Curto Prazo (até 1 ano)</p>
              <p class="text-sm mb-3 text-green-800 dark:text-green-300"><strong>Características:</strong> Valores menores, urgência maior, risco baixo</p>
              <p class="text-sm font-semibold mb-2 text-green-900 dark:text-green-200">Exemplos:</p>
              <ul class="text-sm space-y-1 text-green-700 dark:text-green-400">
                <li>• Comprar um celular novo (R$ 2.000)</li>
                <li>• Fazer uma viagem de férias (R$ 3.000)</li>
                <li>• Reformar um cômodo (R$ 5.000)</li>
                <li>• Pagar um curso (R$ 1.500)</li>
              </ul>
              <p class="text-sm mt-3 text-green-800 dark:text-green-300"><strong>Onde guardar:</strong> Poupança, CDB liquidez diária, Tesouro Selic</p>
            </div>
            <div class="border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5">
              <p class="text-xl font-bold text-blue-900 dark:text-blue-200 mb-3">🚶 Médio Prazo (1 a 5 anos)</p>
              <p class="text-sm mb-3 text-blue-800 dark:text-blue-300"><strong>Características:</strong> Valores médios, alguma flexibilidade, risco moderado</p>
              <p class="text-sm font-semibold mb-2 text-blue-900 dark:text-blue-200">Exemplos:</p>
              <ul class="text-sm space-y-1 text-blue-700 dark:text-blue-400">
                <li>• Trocar de carro (R$ 40.000)</li>
                <li>• Entrada de apartamento (R$ 80.000)</li>
                <li>• MBA ou pós-graduação (R$ 25.000)</li>
                <li>• Casamento (R$ 50.000)</li>
              </ul>
              <p class="text-sm mt-3 text-blue-800 dark:text-blue-300"><strong>Onde guardar:</strong> CDB prazos médios, Tesouro IPCA+, LCI/LCA</p>
            </div>
            <div class="border-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20 rounded-xl p-5">
              <p class="text-xl font-bold text-purple-900 dark:text-purple-200 mb-3">🧘 Longo Prazo (5+ anos)</p>
              <p class="text-sm mb-3 text-purple-800 dark:text-purple-300"><strong>Características:</strong> Valores altos, tempo para recuperar oscilações, risco variado</p>
              <p class="text-sm font-semibold mb-2 text-purple-900 dark:text-purple-200">Exemplos:</p>
              <ul class="text-sm space-y-1 text-purple-700 dark:text-purple-400">
                <li>• Aposentadoria confortável</li>
                <li>• Comprar casa própria sem financiamento (R$ 500.000)</li>
                <li>• Faculdade dos filhos (R$ 200.000)</li>
                <li>• Independência financeira</li>
              </ul>
              <p class="text-sm mt-3 text-purple-800 dark:text-purple-300"><strong>Onde guardar:</strong> Ações, Fundos Imobiliários, Previdência Privada, ETFs</p>
            </div>
          </div>
        `
      },
      {
        titulo: 'Método SMART para Metas',
        conteudo: `
          <p class="mb-4">Use o método SMART para criar metas realmente alcançáveis e motivadoras:</p>
          <div class="space-y-4 my-6">
            <div class="bg-white dark:bg-gray-800 rounded-lg p-5 border-l-4 border-blue-500">
              <p class="font-bold text-lg mb-2 text-blue-900 dark:text-blue-200">S - Específica (Specific)</p>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Seja detalhado sobre o que quer alcançar.</p>
              <div class="text-sm">
                <p class="text-red-600 mb-1">❌ Vago: "Quero viajar"</p>
                <p class="text-green-600">✅ Específico: "Quero conhecer Fernando de Noronha por 7 dias"</p>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg p-5 border-l-4 border-green-500">
              <p class="font-bold text-lg mb-2 text-green-900 dark:text-green-200">M - Mensurável (Measurable)</p>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Defina um valor exato para acompanhar progresso.</p>
              <div class="text-sm">
                <p class="text-red-600 mb-1">❌ Vago: "Guardar dinheiro"</p>
                <p class="text-green-600">✅ Mensurável: "Juntar R$ 8.000 para a viagem"</p>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg p-5 border-l-4 border-purple-500">
              <p class="font-bold text-lg mb-2 text-purple-900 dark:text-purple-200">A - Alcançável (Achievable)</p>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Seja realista com sua situação financeira.</p>
              <div class="text-sm">
                <p class="text-red-600 mb-1">❌ Irreal: "Juntar R$ 100.000 em 1 ano ganhando R$ 3.000"</p>
                <p class="text-green-600">✅ Realista: "Juntar R$ 8.000 em 10 meses poupando R$ 800/mês"</p>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg p-5 border-l-4 border-orange-500">
              <p class="font-bold text-lg mb-2 text-orange-900 dark:text-orange-200">R - Relevante (Relevant)</p>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">A meta deve fazer sentido para VOCÊ e seus valores.</p>
              <div class="text-sm">
                <p class="text-gray-600 dark:text-gray-400">Não copie metas dos outros. Pergunte-se: "Isso realmente importa pra mim?"</p>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg p-5 border-l-4 border-red-500">
              <p class="font-bold text-lg mb-2 text-red-900 dark:text-red-200">T - Temporal (Time-bound)</p>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Estabeleça um prazo claro.</p>
              <div class="text-sm">
                <p class="text-red-600 mb-1">❌ Sem prazo: "Um dia vou viajar"</p>
                <p class="text-green-600">✅ Com prazo: "Viajar em dezembro de 2025"</p>
              </div>
            </div>
          </div>
          <div class="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg p-6 my-6">
            <p class="font-bold text-xl mb-3">✅ Exemplo Completo de Meta SMART:</p>
            <p class="bg-white/20 backdrop-blur rounded-lg p-4 text-sm">"Juntar R$ 8.000 até dezembro de 2025 para fazer uma viagem de 7 dias em Fernando de Noronha com minha família, economizando R$ 800 por mês em gastos supérfluos."</p>
          </div>
        `
      },
      {
        titulo: 'Criando Seu Plano de Ação',
        conteudo: `
          <p class="mb-4">Ter uma meta é ótimo. Ter um plano para alcançá-la é essencial. Veja como:</p>
          <div class="space-y-4 my-6">
            <div class="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
              <p class="text-xl font-bold mb-4 text-blue-900 dark:text-blue-200">📋 Passo a Passo:</p>
              <div class="space-y-4">
                <div class="flex items-start gap-3">
                  <span class="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">1</span>
                  <div class="flex-1">
                    <p class="font-semibold text-blue-900 dark:text-blue-200">Defina a meta SMART</p>
                    <p class="text-sm text-blue-800 dark:text-blue-300">Ex: "Juntar R$ 8.000 em 10 meses para viagem"</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <span class="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">2</span>
                  <div class="flex-1">
                    <p class="font-semibold text-blue-900 dark:text-blue-200">Calcule o aporte mensal</p>
                    <p class="text-sm text-blue-800 dark:text-blue-300">R$ 8.000 ÷ 10 meses = R$ 800/mês</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <span class="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">3</span>
                  <div class="flex-1">
                    <p class="font-semibold text-blue-900 dark:text-blue-200">Identifique de onde virá o dinheiro</p>
                    <p class="text-sm text-blue-800 dark:text-blue-300">• Reduzir delivery: R$ 300<br/>• Cancelar streaming: R$ 100<br/>• Freelance extra: R$ 400</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <span class="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">4</span>
                  <div class="flex-1">
                    <p class="font-semibold text-blue-900 dark:text-blue-200">Escolha onde investir</p>
                    <p class="text-sm text-blue-800 dark:text-blue-300">Tesouro Selic ou CDB liquidez diária (objetivo de curto prazo)</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <span class="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">5</span>
                  <div class="flex-1">
                    <p class="font-semibold text-blue-900 dark:text-blue-200">Automatize os aportes</p>
                    <p class="text-sm text-blue-800 dark:text-blue-300">Configure transferência automática no dia do pagamento</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <span class="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">6</span>
                  <div class="flex-1">
                    <p class="font-semibold text-blue-900 dark:text-blue-200">Acompanhe mensalmente</p>
                    <p class="text-sm text-blue-800 dark:text-blue-300">Use app (como MoneyMap) para ver progresso visual</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 my-4">
            <p class="font-semibold text-green-900 dark:text-green-200">🎯 Dica Pro:</p>
            <p class="text-green-800 dark:text-green-300 text-sm">Crie uma conta específica para cada meta grande. Isso evita "desvios" e torna o progresso mais visual e motivador!</p>
          </div>
        `
      },
      {
        titulo: 'Mantendo a Motivação',
        conteudo: `
          <p class="mb-4">A maior dificuldade não é começar, mas manter-se firme mês após mês. Use estas táticas:</p>
          <div class="space-y-3 my-6">
            <div class="flex items-start gap-3 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <span class="text-2xl">🖼️</span>
              <div>
                <p class="font-semibold text-purple-900 dark:text-purple-200">Visualização</p>
                <p class="text-sm text-purple-800 dark:text-purple-300">Cole foto do seu objetivo na geladeira, use como papel de parede do celular. Ver diariamente reforça o desejo.</p>
              </div>
            </div>
            <div class="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <span class="text-2xl">📊</span>
              <div>
                <p class="font-semibold text-blue-900 dark:text-blue-200">Gráfico de Progresso</p>
                <p class="text-sm text-blue-800 dark:text-blue-300">Crie um gráfico visual (pode ser em papel mesmo!) e pinte conforme avança. Ver a barra crescer é viciante!</p>
              </div>
            </div>
            <div class="flex items-start gap-3 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <span class="text-2xl">🎉</span>
              <div>
                <p class="font-semibold text-green-900 dark:text-green-200">Marcos de Comemoração</p>
                <p class="text-sm text-green-800 dark:text-green-300">A cada 25% conquistado, comemore de forma modesta mas significativa (jantar especial, programa diferente).</p>
              </div>
            </div>
            <div class="flex items-start gap-3 bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <span class="text-2xl">👥</span>
              <div>
                <p class="font-semibold text-orange-900 dark:text-orange-200">Parceiro de Metas</p>
                <p class="text-sm text-orange-800 dark:text-orange-300">Compartilhe sua meta com alguém de confiança. Reportar progresso mensal aumenta comprometimento.</p>
              </div>
            </div>
            <div class="flex items-start gap-3 bg-pink-50 dark:bg-pink-900/20 p-4 rounded-lg">
              <span class="text-2xl">💪</span>
              <div>
                <p class="font-semibold text-pink-900 dark:text-pink-200">Lembre-se do "Por quê"</p>
                <p class="text-sm text-pink-800 dark:text-pink-300">Nos momentos difíceis, relembre POR QUE essa meta é importante. Escreva isso e releia quando desanimar.</p>
              </div>
            </div>
          </div>
          <div class="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 my-4">
            <p class="font-semibold text-yellow-900 dark:text-yellow-200">⚠️ Atenção:</p>
            <p class="text-yellow-800 dark:text-yellow-300 text-sm">Se precisar pausar ou ajustar uma meta por motivos legítimos (emergência, mudança de prioridade), tudo bem! Revise e adapte, mas não desista completamente.</p>
          </div>
          <div class="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg p-6 my-6 text-center">
            <p class="text-2xl font-bold mb-2">🏆 Você é Capaz!</p>
            <p class="mb-3">Metas financeiras não são sobre privação, são sobre LIBERDADE.</p>
            <p class="text-sm opacity-90">Liberdade para fazer escolhas, realizar sonhos e viver com tranquilidade.</p>
            <p class="font-bold text-xl mt-4">Comece hoje. Seu eu do futuro agradecerá! 🚀</p>
          </div>
        `
      }
    ]
  }
}

// Dados resumidos dos eBooks
const ebooks = [
  {
    id: 1,
    titulo: 'Planejamento Financeiro Pessoal',
    descricao: 'Aprenda a organizar suas finanças pessoais, criar um orçamento eficiente e controlar seus gastos mensais. Descubra técnicas práticas para equilibrar receitas e despesas.',
    icone: FileText,
    cor: 'from-blue-500 to-indigo-500',
    corBg: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
    paginas: 5,
    nivel: 'Iniciante',
  },
  {
    id: 2,
    titulo: 'Reserva de Emergência',
    descricao: 'Entenda a importância de ter uma reserva financeira para imprevistos. Saiba quanto guardar, onde investir e como construir seu colchão de segurança financeira.',
    icone: Shield,
    cor: 'from-emerald-500 to-teal-500',
    corBg: 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20',
    paginas: 5,
    nivel: 'Iniciante',
  },
  {
    id: 3,
    titulo: 'Tipos de Renda e Investimentos',
    descricao: 'Explore o mundo dos investimentos! Conheça a diferença entre renda fixa e variável, descubra opções como Tesouro Direto, CDB, ações e fundos imobiliários.',
    icone: TrendingUp,
    cor: 'from-purple-500 to-violet-500',
    corBg: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20',
    paginas: 5,
    nivel: 'Intermediário',
  },
  {
    id: 4,
    titulo: 'Consumo Consciente',
    descricao: 'Desenvolva hábitos de consumo mais sustentáveis e inteligentes. Aprenda a diferenciar necessidades de desejos e fazer escolhas financeiras mais conscientes.',
    icone: Heart,
    cor: 'from-pink-500 to-rose-500',
    corBg: 'from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20',
    paginas: 5,
    nivel: 'Iniciante',
  },
  {
    id: 5,
    titulo: 'Uso Responsável do Crédito',
    descricao: 'Saiba como usar cartão de crédito, empréstimos e financiamentos de forma inteligente. Evite armadilhas de juros altos e mantenha sua saúde financeira em dia.',
    icone: CreditCard,
    cor: 'from-orange-500 to-amber-500',
    corBg: 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20',
    paginas: 5,
    nivel: 'Intermediário',
  },
  {
    id: 6,
    titulo: 'Metas Financeiras e Sonhos',
    descricao: 'Transforme seus sonhos em realidade através do planejamento financeiro. Aprenda a estabelecer metas claras, criar planos de ação e alcançar seus objetivos.',
    icone: Target,
    cor: 'from-cyan-500 to-blue-500',
    corBg: 'from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20',
    paginas: 5,
    nivel: 'Iniciante',
  },
]

// Vídeos do Mini Curso
const videosMinicurso = [
  {
    id: 1,
    titulo: 'Aula 1: Introdução à Educação Financeira',
    descricao: 'Aprenda os conceitos básicos para começar sua jornada financeira',
    videoId: 'CB5zuxQl5ro',
    duracao: '15 min',
    cor: 'from-blue-500 to-indigo-500',
  },
  {
    id: 2,
    titulo: 'Aula 2: Planejamento e Orçamento',
    descricao: 'Como criar um orçamento pessoal eficiente',
    videoId: 'SMCe1ZHS4Ag',
    duracao: '18 min',
    cor: 'from-emerald-500 to-teal-500',
  },
  {
    id: 3,
    titulo: 'Aula 3: Controle de Gastos',
    descricao: 'Técnicas para controlar e reduzir despesas',
    videoId: 'AfMGeMZmyUU',
    duracao: '20 min',
    cor: 'from-purple-500 to-violet-500',
  },
  {
    id: 4,
    titulo: 'Aula 4: Reserva de Emergência',
    descricao: 'Construa seu colchão de segurança financeira',
    videoId: 'CPeQs7CAaZQ',
    duracao: '16 min',
    cor: 'from-pink-500 to-rose-500',
  },
  {
    id: 5,
    titulo: 'Aula 5: Primeiros Investimentos',
    descricao: 'Comece a investir de forma segura e inteligente',
    videoId: 'KuRZucr-YLE',
    duracao: '22 min',
    cor: 'from-orange-500 to-amber-500',
  },
  {
    id: 6,
    titulo: 'Aula 6: Metas e Objetivos Financeiros',
    descricao: 'Planeje e alcance seus sonhos financeiros',
    videoId: 'Qx5dYnV8BAM',
    duracao: '19 min',
    cor: 'from-cyan-500 to-blue-500',
  },
]

// Modal do player de vídeo
function VideoPlayerModal({ video, onClose, onComplete, isCompleted }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Bloquear scroll do body mantendo a posição
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${scrollBarWidth}px`
    
    // Trigger animation
    setTimeout(() => setIsVisible(true), 10)
    
    return () => {
      // Restaurar scroll
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [])

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setIsVisible(false)
        setTimeout(onClose, 300)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  return (
    <div 
      className={`absolute z-50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        position: 'absolute',
        top: '1600px',
        left: 0,
        right: 0,
        minHeight: '100vh',
        width: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: `${window.scrollY + 50}px`,
        paddingBottom: '2rem',
        paddingLeft: '1rem',
        paddingRight: '1rem'
      }}
      onClick={handleClose}
    >
      <div 
        className={`relative w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{
          maxWidth: '900px',
          maxHeight: '90vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 p-4 flex-shrink-0">
          <div className="flex-1 pr-4">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{video.titulo}</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{video.descricao}</p>
          </div>
          <button
            onClick={handleClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors flex-shrink-0"
          >
            <X className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative w-full flex-shrink-0" style={{ paddingTop: '56.25%' }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0`}
            title={video.titulo}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Footer com botão de conclusão */}
        <div className="p-6 bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 flex-shrink-0">
          {!isCompleted ? (
            <button
              onClick={onComplete}
              className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r ${video.cor} text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all`}
            >
              <CheckCircle className="h-5 w-5" />
              Marcar como Concluída
            </button>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold">
                <CheckCircle className="h-5 w-5" />
                Aula Concluída!
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Card de vídeo
function VideoCard({ video, onPlay, isCompleted }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-200/60 bg-white dark:bg-zinc-900 dark:border-zinc-800 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
        <img
          src={`https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`}
          alt={video.titulo}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Overlay com play button */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className={`flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${video.cor} shadow-2xl`}>
            <Play className="h-8 w-8 text-white ml-1" fill="white" />
          </div>
        </div>

        {/* Badge de duração */}
        <div className="absolute bottom-3 right-3 px-3 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-white text-xs font-semibold">
          {video.duracao}
        </div>

        {/* Badge de concluído */}
        {isCompleted && (
          <div className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-green-500 text-white text-xs font-semibold flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Concluída
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 line-clamp-2">
          {video.titulo}
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">
          {video.descricao}
        </p>

        <button
          onClick={onPlay}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r ${video.cor} text-white font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all`}
        >
          <Play className="h-4 w-4" fill="white" />
          Assistir Aula
        </button>
      </div>
    </div>
  )
}

// Modal visualizador de eBook (HTML)
function EbookViewerModal({ ebook, onClose }) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [paginaAtual, setPaginaAtual] = useState(0)

  const conteudo = ebooksConteudo[ebook.id]
  const totalPaginas = conteudo?.paginas?.length || 0

  // Impedir scroll do body quando modal está aberto
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // Fechar com tecla ESC e navegar com setas
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && paginaAtual > 0) setPaginaAtual(paginaAtual - 1)
      if (e.key === 'ArrowRight' && paginaAtual < totalPaginas - 1) setPaginaAtual(paginaAtual + 1)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, paginaAtual, totalPaginas])

  const handleDownload = () => {
    // Cria um HTML completo do eBook para download
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${ebook.titulo} - MoneyMap</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #4f46e5; border-bottom: 3px solid #4f46e5; padding-bottom: 10px; }
          h2 { color: #6366f1; margin-top: 30px; }
          .page { page-break-after: always; margin-bottom: 40px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; }
          ul, ol { padding-left: 20px; }
          strong { color: #1f2937; }
        </style>
      </head>
      <body>
        <h1>${ebook.titulo}</h1>
        <p><strong>MoneyMap - Educação Financeira</strong></p>
        <p>Nível: ${ebook.nivel} | ${totalPaginas} páginas</p>
        <hr>
        ${conteudo.paginas.map((pagina, idx) => `
          <div class="page">
            <h2>Página ${idx + 1}: ${pagina.titulo}</h2>
            ${pagina.conteudo}
          </div>
        `).join('')}
        <hr>
        <p style="text-align: center; color: #6b7280; font-size: 14px;">
          © ${new Date().getFullYear()} MoneyMap - Todos os direitos reservados
        </p>
      </body>
      </html>
    `
    
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${ebook.titulo.replace(/ /g, '_')}_MoneyMap.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const Icon = ebook.icone
  const paginaConteudo = conteudo?.paginas[paginaAtual]

  return (
    <div 
      className="fixed inset-0 z-50 flex bg-black/90 backdrop-blur-sm animate-in fade-in duration-300"
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: '95vh'
      }}
      onClick={onClose}
    >
      <div 
        className={`relative flex flex-col bg-white dark:bg-zinc-900 shadow-2xl transition-all duration-300 ${
          isFullscreen 
            ? 'h-screen w-screen rounded-none' 
            : 'h-[90vh] w-[95vw] max-w-5xl rounded-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do visualizador */}
        <div className={`flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700/50 bg-gradient-to-r ${ebook.cor} px-6 py-4 ${isFullscreen ? 'rounded-none' : 'rounded-t-2xl'}`}>
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{ebook.titulo}</h2>
              <p className="text-sm text-white/80">{totalPaginas} páginas • {ebook.nivel}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Botão Download */}
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/30"
              title="Baixar eBook"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </button>

            {/* Botão Fullscreen */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm transition-all hover:bg-white/30"
              title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
            >
              {isFullscreen ? (
                <Minimize2 className="h-5 w-5 text-white" />
              ) : (
                <Maximize2 className="h-5 w-5 text-white" />
              )}
            </button>

            {/* Botão Fechar */}
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm transition-all hover:bg-red-500/80"
              title="Fechar (ESC)"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Conteúdo do eBook */}
        <div className={`relative flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800 px-8 ${isFullscreen ? 'py-20 md:py-24' : 'py-12 md:py-16'}`}>
          <div className="mx-auto max-w-3xl">
            {/* Título da página */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
                {paginaConteudo?.titulo}
              </h1>
              <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                <span>Página {paginaAtual + 1} de {totalPaginas}</span>
                <span>•</span>
                <span>{ebook.nivel}</span>
              </div>
            </div>

            {/* Conteúdo HTML da página */}
            <div 
              className="prose prose-lg dark:prose-invert max-w-none 
                prose-headings:text-zinc-900 dark:prose-headings:text-white
                prose-p:text-zinc-700 dark:prose-p:text-zinc-300
                prose-li:text-zinc-700 dark:prose-li:text-zinc-300
                prose-strong:text-zinc-900 dark:prose-strong:text-white
                prose-a:text-blue-600 dark:prose-a:text-blue-400"
              dangerouslySetInnerHTML={{ __html: paginaConteudo?.conteudo || '' }}
            />
          </div>
        </div>

        {/* Footer com navegação */}
        <div className="border-t border-zinc-200 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/95 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Botão Anterior */}
            <button
              type="button"
              onClick={() => setPaginaAtual(paginaAtual - 1)}
              disabled={paginaAtual === 0}
              className="flex items-center gap-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 transition-all hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Página Anterior (←)"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Anterior</span>
            </button>

            {/* Indicador de páginas */}
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPaginas }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setPaginaAtual(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === paginaAtual 
                      ? 'w-8 bg-gradient-to-r ' + ebook.cor
                      : 'w-2 bg-zinc-300 dark:bg-zinc-600 hover:bg-zinc-400 dark:hover:bg-zinc-500'
                  }`}
                  title={`Ir para página ${idx + 1}`}
                />
              ))}
            </div>

            {/* Botão Próxima */}
            <button
              type="button"
              onClick={() => setPaginaAtual(paginaAtual + 1)}
              disabled={paginaAtual === totalPaginas - 1}
              className="flex items-center gap-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 transition-all hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Próxima Página (→)"
            >
              <span className="hidden sm:inline">Próxima</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Dicas de navegação */}
          <div className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
            💡 Use as setas do teclado (← →) para navegar • ESC para fechar
          </div>
        </div>
      </div>
    </div>
  )
}

function EbookCard({ ebook, onRead }) {
  const Icon = ebook.icone

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-200/60 bg-white/80 backdrop-blur-md shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-white/10 dark:bg-zinc-900/80">
      {/* Capa do eBook com gradiente */}
      <div 
        className={`relative h-48 bg-gradient-to-br ${ebook.cor} p-6 cursor-pointer`}
        onClick={() => onRead(ebook)}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent)] opacity-50"></div>
        <div className="relative flex h-full flex-col items-center justify-center text-white">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm shadow-xl transition-transform duration-300 group-hover:scale-110">
            <Icon className="h-10 w-10" />
          </div>
          <div className="rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold">
            {ebook.paginas} páginas
          </div>
        </div>

        {/* Overlay de leitura no hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="rounded-xl bg-white/20 backdrop-blur-md px-6 py-3 text-sm font-semibold text-white">
            Clique para ler
          </div>
        </div>
      </div>

      {/* Conteúdo do card */}
      <div className="p-6">
        <div className="mb-3 flex items-center justify-between">
          <span className={`rounded-lg px-3 py-1 text-xs font-semibold ${
            ebook.nivel === 'Iniciante' 
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
          }`}>
            {ebook.nivel}
          </span>
          <BookOpen className="h-5 w-5 text-zinc-400" />
        </div>

        <h3 
          className="mb-3 text-xl font-bold text-zinc-800 transition-colors cursor-pointer group-hover:text-violet-600 dark:text-white dark:group-hover:text-violet-400"
          onClick={() => onRead(ebook)}
        >
          {ebook.titulo}
        </h3>

        <p className="mb-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {ebook.descricao}
        </p>

        {/* Botões de ação */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onRead(ebook)}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${ebook.cor} px-4 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg`}
          >
            <BookOpen className="h-4 w-4" />
            Ler Agora
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Educacao() {
  const [ebookSelecionado, setEbookSelecionado] = useState(null)
  const [videoSelecionado, setVideoSelecionado] = useState(null)
  const [aulasCompletas, setAulasCompletas] = useState([])
  const [cursoFinalizado, setCursoFinalizado] = useState(false)

  const abrirEbook = (ebook) => {
    setEbookSelecionado(ebook)
  }

  const fecharEbook = () => {
    setEbookSelecionado(null)
  }

  const abrirVideo = (video) => {
    setVideoSelecionado(video)
  }

  const fecharVideo = () => {
    setVideoSelecionado(null)
  }

  const marcarAulaConcluida = (videoId) => {
    if (!aulasCompletas.includes(videoId)) {
      const novasAulasCompletas = [...aulasCompletas, videoId]
      setAulasCompletas(novasAulasCompletas)
      
      // Verificar se todas as aulas foram concluídas
      if (novasAulasCompletas.length === videosMinicurso.length) {
        setCursoFinalizado(true)
      }
      
      // Avançar para próximo vídeo
      const indexAtual = videosMinicurso.findIndex(v => v.id === videoId)
      if (indexAtual < videosMinicurso.length - 1) {
        setTimeout(() => {
          fecharVideo()
          setTimeout(() => {
            abrirVideo(videosMinicurso[indexAtual + 1])
          }, 300)
        }, 1000)
      } else {
        setTimeout(() => {
          fecharVideo()
        }, 1500)
      }
    }
  }

  const progresso = (aulasCompletas.length / videosMinicurso.length) * 100

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Fundo com gradiente animado */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-indigo-100 to-purple-100 dark:from-zinc-950 dark:via-violet-950/20 dark:to-purple-950/30" />
        <div className="absolute -top-24 -left-24 h-96 w-96 animate-pulse rounded-full bg-gradient-to-r from-violet-400/20 to-purple-500/20 blur-3xl" />
        <div
          className="absolute -bottom-32 -right-32 h-80 w-80 animate-pulse rounded-full bg-gradient-to-r from-indigo-400/20 to-violet-500/20 blur-3xl"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute left-1/3 top-1/2 h-64 w-64 animate-pulse rounded-full bg-gradient-to-r from-purple-400/10 to-fuchsia-400/10 blur-2xl"
          style={{ animationDelay: '4s' }}
        />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.9) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Header fixo */}
      <div className="sticky top-0 z-20 w-full border-b border-zinc-200/60 bg-white/90 backdrop-blur-xl shadow-lg shadow-zinc-100/50 dark:border-white/10 dark:bg-zinc-900/90 dark:shadow-zinc-900/50">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-xl">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-zinc-900 to-zinc-700 bg-clip-text text-3xl font-bold text-transparent dark:from-zinc-100 dark:to-zinc-300">
                Educação Financeira
              </h1>
              <p className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Biblioteca de eBooks para transformar sua vida financeira
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="mx-auto max-w-[1600px] px-6 py-12 lg:px-8">
        {/* Introdução */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700 dark:border-violet-800 dark:bg-violet-900/30 dark:text-violet-300">
            <BookOpen className="h-4 w-4" />
            <span>6 eBooks Gratuitos</span>
          </div>
          <h2 className="mb-4 text-4xl font-bold text-zinc-800 dark:text-white">
            📚 Biblioteca de Conhecimento Financeiro
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Expanda seus conhecimentos com nossa coleção completa de eBooks sobre educação financeira.
            Material prático e acessível para todos os níveis.
          </p>
        </div>

        {/* Grid de eBooks */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {ebooks.map((ebook) => (
            <EbookCard key={ebook.id} ebook={ebook} onRead={abrirEbook} />
          ))}
        </div>

        {/* Divisor decorativo */}
        <div className="my-20 flex items-center justify-center">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-700 to-transparent" />
          <div className="px-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
              <Play className="h-6 w-6 text-white" fill="white" />
            </div>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-700 to-transparent" />
        </div>

        {/* Seção Mini Curso em Vídeo */}
        <div className="mb-12">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
              <Play className="h-4 w-4" />
              <span>6 Vídeo Aulas</span>
            </div>
            <h2 className="mb-4 text-4xl font-bold text-zinc-800 dark:text-white">
              🎓 Mini Curso de Educação Financeira
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
              Assista às aulas completas, marque como concluídas e acompanhe seu progresso de aprendizado
            </p>
          </div>

          {/* Barra de Progresso */}
          <div className="mb-8 mx-auto max-w-3xl">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                Progresso do Curso
              </span>
              <span className="font-bold text-violet-600 dark:text-violet-400">
                {aulasCompletas.length}/{videosMinicurso.length} aulas ({Math.round(progresso)}%)
              </span>
            </div>
            <div className="relative h-4 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 transition-all duration-700 ease-out relative overflow-hidden"
                style={{ width: `${progresso}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-shimmer" />
              </div>
            </div>
          </div>

          {/* Mensagem de Conclusão */}
          {cursoFinalizado && (
            <div className="mb-8 mx-auto max-w-3xl animate-bounce-in">
              <div className="rounded-2xl border-2 border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-8 text-center shadow-2xl">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-xl animate-pulse">
                    <Award className="h-10 w-10 text-white" />
                  </div>
                </div>
                <h3 className="mb-2 text-3xl font-bold text-green-700 dark:text-green-400">
                  🎉 Curso Concluído!
                </h3>
                <p className="text-lg text-green-600 dark:text-green-300">
                  Parabéns por finalizar o Mini Curso de Educação Financeira!
                </p>
              </div>
            </div>
          )}

          {/* Grid de Vídeos */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {videosMinicurso.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onPlay={() => abrirVideo(video)}
                isCompleted={aulasCompletas.includes(video.id)}
              />
            ))}
          </div>
        </div>

        {/* Frase motivacional */}
        <div className="mt-12 text-center italic text-zinc-500 dark:text-zinc-400">
          💡 "Investir em conhecimento rende os melhores juros." - Benjamin Franklin
        </div>

        {/* Rodapé */}
        <div className="mt-8 pt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
          © 2024 MoneyMap. Todos os direitos reservados.
        </div>
      </div>

      {/* Modal do visualizador de eBook */}
      {ebookSelecionado && (
        <EbookViewerModal ebook={ebookSelecionado} onClose={fecharEbook} />
      )}

      {/* Modal do player de vídeo */}
      {videoSelecionado && (
        <VideoPlayerModal
          video={videoSelecionado}
          onClose={fecharVideo}
          onComplete={() => marcarAulaConcluida(videoSelecionado.id)}
          isCompleted={aulasCompletas.includes(videoSelecionado.id)}
        />
      )}
    </div>
  )
}
