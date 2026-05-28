'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'
import type { Category, RecurringExpense } from '@/lib/types'
import { X } from 'lucide-react'

interface AddRecurringModalProps {
  categories: Category[]
  currency: string
  editItem?: RecurringExpense
  onClose: () => void
  onSuccess: () => void
}

export function AddRecurringModal({ categories, currency, editItem, onClose, onSuccess }: AddRecurringModalProps) {
  const [name, setName] = useState(editItem?.name ?? '')
  const [amount, setAmount] = useState(String(editItem?.amount ?? ''))
  const [categoryId, setCategoryId] = useState(editItem?.category_id ?? '')
  const [billingDay, setBillingDay] = useState(String(editItem?.billing_day ?? '1'))
  const [frequency, setFrequency] = useState(editItem?.frequency ?? 'monthly')
  const [notes, setNotes] = useState(editItem?.notes ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const parsedAmount = parseFloat(amount)
    if (!name || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Nome e importo sono obbligatori')
      return
    }
    const day = parseInt(billingDay)
    if (isNaN(day) || day < 1 || day > 31) {
      setError('Giorno di addebito non valido (1-31)')
      return
    }

    setLoading(true)
    const payload = {
      name,
      amount: parsedAmount,
      category_id: categoryId || null,
      billing_day: day,
      frequency,
      notes: notes || null,
    }

    if (editItem) {
      const { error: err } = await supabase.schema('finance').from('recurring_expenses')
        .update(payload).eq('id', editItem.id)
      if (err) { setError(err.message); setLoading(false); return }
    } else {
      const { error: err } = await supabase.schema('finance').from('recurring_expenses')
        .insert(payload)
      if (err) { setError(err.message); setLoading(false); return }
    }

    setLoading(false)
    onSuccess()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <h2 className="font-semibold text-zinc-100">
            {editItem ? 'Modifica spesa ricorrente' : 'Nuova spesa ricorrente'}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Input label="Nome" placeholder="Es. Netflix, Affitto..." value={name} onChange={e => setName(e.target.value)} required />

          <Input label={`Importo (${currency === 'EUR' ? '€' : currency})`} type="number" step="0.01" min="0" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} required />

          <div className="grid grid-cols-2 gap-3">
            <Input label="Giorno addebito" type="number" min="1" max="31" value={billingDay} onChange={e => setBillingDay(e.target.value)} />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-300">Frequenza</label>
              <select
                value={frequency}
                onChange={e => setFrequency(e.target.value as 'monthly' | 'quarterly' | 'yearly')}
                className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="monthly">Mensile</option>
                <option value="quarterly">Trimestrale</option>
                <option value="yearly">Annuale</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">Categoria</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="">— Nessuna categoria —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <Input label="Note (opzionale)" placeholder="Es. Piano famiglia, scadenza 2026..." value={notes} onChange={e => setNotes(e.target.value)} />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Annulla</Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
              {loading ? 'Salvataggio...' : editItem ? 'Salva modifiche' : 'Aggiungi'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
