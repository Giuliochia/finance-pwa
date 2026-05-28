'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'
import type { Category, TransactionType } from '@/lib/types'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AddTransactionModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function AddTransactionModal({ onClose, onSuccess }: AddTransactionModalProps) {
  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  useEffect(() => {
    supabase
      .schema('finance')
      .from('categories')
      .select('*')
      .eq('type', type)
      .order('name')
      .then(({ data }) => {
        setCategories(data ?? [])
        setCategoryId('')
      })
  }, [type])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Inserisci un importo valido')
      return
    }

    setLoading(true)
    const { error: err } = await supabase
      .schema('finance')
      .from('transactions')
      .insert({
        type,
        amount: Number(amount),
        description: description || null,
        category_id: categoryId || null,
        transaction_date: date,
      })

    setLoading(false)
    if (err) { setError(err.message); return }
    onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <h2 className="font-semibold text-zinc-100">Nuova transazione</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Type toggle */}
          <div className="flex gap-2 p-1 bg-zinc-800 rounded-xl">
            {(['expense', 'income'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  'flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                  type === t
                    ? t === 'income'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-red-500 text-white'
                    : 'text-zinc-500 hover:text-zinc-300',
                )}
              >
                {t === 'income' ? 'Entrata' : 'Uscita'}
              </button>
            ))}
          </div>

          <Input
            label="Importo (€)"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">Categoria</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="">— Nessuna categoria —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <Input
            label="Descrizione"
            placeholder="Es. Cena al ristorante"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Input
            label="Data"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
              Annulla
            </Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
              {loading ? 'Salvataggio...' : 'Aggiungi'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
