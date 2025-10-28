import React, { useEffect, useState } from 'react'
import Modal from './ui/Modal'
import Input from './ui/Input'
import Button from './ui/Button'
import api from '../services/api'

export default function GoalModal({ isOpen, onClose, initial = null, onSaved }) {
  const [title, setTitle] = useState('')
  const [target, setTarget] = useState('')
  const [current, setCurrent] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (initial) {
      setTitle(initial.title || '')
      setTarget(initial.targetAmount ?? '')
      setCurrent(initial.currentAmount ?? '')
      setDueDate(initial.dueDate ?? '')
    } else {
      setTitle('')
      setTarget('')
      setCurrent('')
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
        targetAmount: target,
        currentAmount: current || undefined,
        dueDate: dueDate || undefined,
      }
      let res
      if (initial && initial.id) {
        res = await api.metas.atualizar(initial.id, payload)
      } else {
        res = await api.metas.criar(payload)
      }

      onSaved && onSaved(res.data.goal)
      onClose()
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Editar Meta' : 'Nova Meta'}>
      <div className="space-y-4">
        <Input label="Título" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input label="Valor alvo (R$)" value={target} onChange={(e) => setTarget(e.target.value)} required />
        <Input label="Valor atual (R$)" value={current} onChange={(e) => setCurrent(e.target.value)} />
        <Input label="Prazo" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />

        {error && <div className="text-sm text-red-600">{error}</div>}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} loading={saving}>{initial ? 'Salvar' : 'Criar'}</Button>
        </div>
      </div>
    </Modal>
  )
}
