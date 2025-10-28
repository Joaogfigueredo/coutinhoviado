import React, { createContext, useContext, useState } from 'react'

const DemoContexto = createContext(null)

// Dados mockados para demonstração
export const dadosDemo = {
  usuario: { 
    id: 1, 
    nome: 'Usuário Demo', 
    email: 'demo@moneymap.com' 
  },
  
  transacoes: [
    { id: 1, data: '2024-01-15', tipo: 'receita', categoria: 'Salário', descricao: 'Salário Janeiro', valor: 5000 },
    { id: 2, data: '2024-01-16', tipo: 'despesa', categoria: 'Alimentação', descricao: 'Supermercado', valor: 250 },
    { id: 3, data: '2024-01-18', tipo: 'despesa', categoria: 'Transporte', descricao: 'Combustível', valor: 150 },
    { id: 4, data: '2024-01-20', tipo: 'receita', categoria: 'Freelance', descricao: 'Projeto Web', valor: 800 },
    { id: 5, data: '2024-01-22', tipo: 'despesa', categoria: 'Lazer', descricao: 'Cinema', valor: 60 },
    { id: 6, data: '2024-01-25', tipo: 'despesa', categoria: 'Saúde', descricao: 'Farmácia', valor: 85 },
    { id: 7, data: '2024-01-28', tipo: 'receita', categoria: 'Investimentos', descricao: 'Dividendos', valor: 120 },
    { id: 8, data: '2024-01-30', tipo: 'despesa', categoria: 'Educação', descricao: 'Curso Online', valor: 199 },
  ],
  
  metas: [
    { id: 1, titulo: 'Comprar Notebook', valor_meta: 3000, valor_atual: 1500, prazo: '2024-06-30' },
    { id: 2, titulo: 'Viagem de Férias', valor_meta: 2500, valor_atual: 800, prazo: '2024-12-20' },
    { id: 3, titulo: 'Reserva de Emergência', valor_meta: 10000, valor_atual: 6200, prazo: '2024-08-15' },
    { id: 4, titulo: 'Curso de Inglês', valor_meta: 1200, valor_atual: 1200, prazo: '2024-03-30' },
  ],
  
  resumo: {
    saldo: 15420,
    receitasMes: 5920,
    despesasMes: 744
  },
  
  relatoriosCategorias: [
    { categoria: 'Alimentação', valor: 250 },
    { categoria: 'Transporte', valor: 150 },
    { categoria: 'Lazer', valor: 60 },
    { categoria: 'Saúde', valor: 85 },
    { categoria: 'Educação', valor: 199 },
  ],
  
  relatoriosMensal: [
    { mes: 'Nov/23', receitas: 4800, despesas: 2100 },
    { mes: 'Dez/23', receitas: 5200, despesas: 1950 },
    { mes: 'Jan/24', receitas: 5920, despesas: 744 },
  ]
}

export function DemoProvider({ children }) {
  const [modoDemo, setModoDemo] = useState(false)
  
  function ativarDemo() {
    setModoDemo(true)
    // Simular login em modo demo
    localStorage.setItem('mm_token', 'demo-token')
    localStorage.setItem('mm_usuario', JSON.stringify(dadosDemo.usuario))
  }
  
  function desativarDemo() {
    setModoDemo(false)
    localStorage.removeItem('mm_token')
    localStorage.removeItem('mm_usuario')
  }
  
  return (
    <DemoContexto.Provider value={{ 
      modoDemo, 
      ativarDemo, 
      desativarDemo, 
      dadosDemo 
    }}>
      {children}
    </DemoContexto.Provider>
  )
}

export function useDemo() {
  return useContext(DemoContexto)
}