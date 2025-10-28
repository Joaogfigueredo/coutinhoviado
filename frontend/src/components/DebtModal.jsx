import React, { useEffect, useState } from 'react'
import Modal from './ui/Modal'
import Input from './ui/Input'
import Button from './ui/Button'
import api from '../services/api'

export default function DebtModal({ isOpen, onClose, initial = null, onSaved }) {
  const [title, setTitle] = useState('')
  const [principal, setPrincipal] = useState('')
  const [interestRate, setInterestRate] = useState('0')
  const [installments, setInstallments] = useState('1')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (initial) {
      setTitle(initial.title || '')
      setPrincipal(initial.principal ?? '')
      setInterestRate(initial.interestRate ?? '0')
      setInstallments(initial.installments ? String(initial.installments) : '1')
      setDueDate(initial.dueDate ? initial.dueDate.slice(0, 10) : '')
    } else {
      setTitle('')
      setPrincipal('')
      setInterestRate('0')
      setInstallments('1')
      setDueDate('')
    }
    setError(null)
  }, [initial, isOpen])

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const payload = {
        title: title.trim(),
        principal,
        interestRate,
        installments: Number(installments) || 1,
        dueDate: dueDate || undefined,
      }

      let res
      if (initial && initial.id) res = await api.debts.atualizar(initial.id, payload)
      else res = await api.debts.criar(payload)

      onSaved && onSaved(res.data.debt)
      onClose()
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Erro ao salvar dívida')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Editar Dívida' : 'Nova Dívida'}>
      <div className="space-y-4">
        <Input label="Título" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input label="Valor Principal (R$)" value={principal} onChange={(e) => setPrincipal(e.target.value)} required />
        <Input label="Taxa de Juros (ex: 0.05 para 5%)" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} />
        <Input label="Parcelas" type="number" min="1" value={installments} onChange={(e) => setInstallments(e.target.value)} />
        <Input label="Vencimento" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />

        {error && <div className="text-sm text-red-600">{error}</div>}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} loading={saving}>{initial ? 'Salvar' : 'Criar'}</Button>
        </div>
      </div>
    </Modal>
  )
}
