import React, { useEffect, useState } from 'react'
import { useTheme } from '../contexts/ThemeContext.jsx'
import api from '../services/api'
import BudgetModal from '../components/BudgetModal'
import Button from '../components/ui/Button'

export default function Budgets() {
  const { isDark } = useTheme()
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    let mounted = true
    async function fetchBudgets() {
      setLoading(true)
      setError(null)
      try {
        const res = await api.budgets.listar()
        if (!mounted) return
        setBudgets(res.data.budgets || [])
      } catch (e) {
        setError(e.response?.data?.error || e.message || 'Erro ao carregar orçamentos')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchBudgets()
    return () => { mounted = false }
  }, [])

  function openCreate() { setEditing(null); setModalOpen(true) }
  function openEdit(budget) { setEditing(budget); setModalOpen(true) }

  function handleSaved(b) {
    setBudgets((prev) => {
      const exists = prev.find((x) => x.id === b.id)
      if (exists) return prev.map((x) => x.id === b.id ? b : x)
      return [b, ...prev]
    })
  }

  async function handleDelete(id) {
    if (!confirm('Remover orçamento?')) return
    try {
      await api.budgets.remover(id)
      setBudgets((p) => p.filter((x) => x.id !== id))
    } catch (e) {
      alert('Falha ao remover: ' + (e.response?.data?.error || e.message))
    }
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-white'} p-6`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Orçamentos</h1>
          <Button onClick={openCreate}>Novo Orçamento</Button>
        </div>

        {loading ? <div>Carregando...</div> : error ? <div className="text-red-600">{error}</div> : (
          <div className="grid grid-cols-1 gap-4">
            {budgets.map((b) => (
              <div key={b.id} className="p-4 rounded-lg border bg-white/60 flex items-center justify-between">
                <div>
                  <div className="font-semibold">{b.name}</div>
                  <div className="text-sm text-gray-600">Limite: R$ {Number(b.limitAmount).toLocaleString('pt-BR')}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(b)} className="px-3 py-1 rounded-lg border">Editar</button>
                  <button onClick={() => handleDelete(b.id)} className="px-3 py-1 rounded-lg bg-red-500 text-white">Remover</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <BudgetModal isOpen={modalOpen} onClose={() => setModalOpen(false)} initial={editing} onSaved={handleSaved} />
      </div>
    </div>
  )
}
