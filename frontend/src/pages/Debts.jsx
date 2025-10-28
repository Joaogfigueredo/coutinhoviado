import React, { useEffect, useState } from 'react'
import { useTheme } from '../contexts/ThemeContext.jsx'
import api from '../services/api'
import DebtModal from '../components/DebtModal'
import Button from '../components/ui/Button'

export default function Debts() {
  const { isDark } = useTheme()
  const [debts, setDebts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    let mounted = true
    async function fetchDebts() {
      setLoading(true)
      setError(null)
      try {
        const res = await api.debts.listar()
        if (!mounted) return
        setDebts(res.data.debts || [])
      } catch (e) {
        setError(e.response?.data?.error || e.message || 'Erro ao carregar dívidas')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchDebts()
    return () => { mounted = false }
  }, [])

  function openCreate() { setEditing(null); setModalOpen(true) }
  function openEdit(debt) { setEditing(debt); setModalOpen(true) }

  function handleSaved(debt) {
    setDebts((prev) => {
      const exists = prev.find((x) => x.id === debt.id)
      if (exists) return prev.map((x) => (x.id === debt.id ? debt : x))
      return [debt, ...prev]
    })
  }

  async function handleDelete(id) {
    if (!confirm('Remover dívida?')) return
    try {
      await api.debts.remover(id)
      setDebts((prev) => prev.filter((x) => x.id !== id))
    } catch (e) {
      alert('Falha ao remover: ' + (e.response?.data?.error || e.message))
    }
  }

  function formatCurrency(value) {
    if (value == null) return '-'
    const num = Number(value)
    if (Number.isNaN(num)) return String(value)
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-white'} p-6`}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Dívidas</h1>
          <Button onClick={openCreate}>Registrar Dívida</Button>
        </div>

        {loading ? <div>Carregando...</div> : error ? <div className="text-red-600">{error}</div> : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dívida</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Principal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Juros</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parcelas</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimento</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {debts.map((debt) => (
                  <tr key={debt.id}>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{debt.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(debt.principal)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{Number(debt.interestRate ?? 0).toLocaleString('pt-BR', { style: 'percent', minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{debt.installments}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{debt.dueDate ? new Date(debt.dueDate).toLocaleDateString('pt-BR') : '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 capitalize">{debt.status}</td>
                    <td className="px-4 py-3 text-right text-sm">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(debt)} className="px-3 py-1 rounded-lg border">Editar</button>
                        <button onClick={() => handleDelete(debt.id)} className="px-3 py-1 rounded-lg bg-red-500 text-white">Remover</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!debts.length && (
              <div className="text-center text-sm text-gray-500 py-6">Nenhuma dívida cadastrada até o momento.</div>
            )}
          </div>
        )}

        <DebtModal isOpen={modalOpen} onClose={() => setModalOpen(false)} initial={editing} onSaved={handleSaved} />
      </div>
    </div>
  )
}
