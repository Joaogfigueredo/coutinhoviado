import React, { useEffect, useState } from 'react'
import Modal from './ui/Modal'
import Input from './ui/Input'
import Button from './ui/Button'
import api from '../services/api'

export default function BudgetModal({ isOpen, onClose, initial = null, onSaved }) {
  const [name, setName] = useState('')
  const [limit, setLimit] = useState('')
  const [period, setPeriod] = useState('monthly')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (initial) {
      setName(initial.name || '')
      setLimit(initial.limitAmount ?? '')
      setPeriod(initial.period ?? 'monthly')
    } else {
      setName('')
      setLimit('')
      setPeriod('monthly')
    }
    setError(null)
  }, [initial, isOpen])

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const payload = { name: name.trim(), limitAmount: limit, period }
      let res
      if (initial && initial.id) res = await api.budgets.atualizar(initial.id, payload)
      else res = await api.budgets.criar(payload)

      onSaved && onSaved(res.data.budget)
      onClose()
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Editar Orçamento' : 'Novo Orçamento'}>
      <div className="space-y-4">
        <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Limite (R$)" value={limit} onChange={(e) => setLimit(e.target.value)} required />
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Período</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="w-full mt-2 px-3 py-2 rounded-lg border">
            <option value="monthly">Mensal</option>
            <option value="weekly">Semanal</option>
            <option value="yearly">Anual</option>
          </select>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} loading={saving}>{initial ? 'Salvar' : 'Criar'}</Button>
        </div>
      </div>
    </Modal>
  )
}
