'use client'
import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'
import type { RecurringExpense, Category } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, PauseCircle, PlayCircle, RefreshCw, AlertTriangle } from 'lucide-react'
import { AddRecurringModal } from './AddRecurringModal'

interface RecurringListProps {
  recurring: RecurringExpense[]
  categories: Category[]
  currency: string
}

const frequencyLabel = { monthly: 'Mensile', quarterly: 'Trimestrale', yearly: 'Annuale' }

export function RecurringList({ recurring, categories, currency }: RecurringListProps) {
  const [showAdd, setShowAdd] = useState(false)
  const [editItem, setEditItem] = useState<RecurringExpense | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const active = recurring.filter(r => r.is_active)
  const inactive = recurring.filter(r => !r.is_active)
  const totalMonthly = active.reduce((s, r) => {
    if (r.frequency === 'monthly') return s + r.amount
    if (r.frequency === 'quarterly') return s + r.amount / 3
    if (r.frequency === 'yearly') return s + r.amount / 12
    return s
  }, 0)

  async function toggleActive(item: RecurringExpense) {
    await supabase.schema('finance').from('recurring_expenses')
      .update({ is_active: !item.is_active })
      .eq('id', item.id)
    router.refresh()
  }

  async function handleDelete(id: string) {
    await supabase.schema('finance').from('recurring_expenses').delete().eq('id', id)
    router.refresh()
  }

  const isDueAudit = (item: RecurringExpense) =>
    item.next_audit_at && new Date(item.next_audit_at) <= new Date()

  return (
    <>
      {/* Totale mensile */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Totale mensile stimato</p>
          <p className="text-2xl font-bold text-red-400">{formatCurrency(totalMonthly, currency)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500">{active.length} attivi</p>
          <p className="text-xs text-zinc-600">{inactive.length} in pausa</p>
        </div>
      </div>

      {/* Aggiungi */}
      <Button variant="outline" className="w-full" onClick={() => setShowAdd(true)}>
        <Plus size={16} />
        Aggiungi spesa ricorrente
      </Button>

      {/* Lista attivi */}
      {active.length === 0 && (
        <Card>
          <p className="text-sm text-zinc-600 text-center py-6">Nessuna spesa ricorrente attiva</p>
        </Card>
      )}

      <div className="space-y-2">
        {active.map(item => (
          <Card key={item.id} className="p-0 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3">
              {/* Icona */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: `${item.category?.color ?? '#6b7280'}18`,
                  color: item.category?.color ?? '#6b7280',
                }}
              >
                <RefreshCw size={16} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-zinc-200 truncate">{item.name}</p>
                  {isDueAudit(item) && (
                    <AlertTriangle size={12} className="text-amber-400 shrink-0" title="Audit richiesto" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="neutral">{frequencyLabel[item.frequency]}</Badge>
                  <span className="text-xs text-zinc-600">giorno {item.billing_day}</span>
                </div>
              </div>

              {/* Importo */}
              <p className="text-sm font-bold text-red-400 shrink-0">{formatCurrency(item.amount, currency)}</p>

              {/* Azioni */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setEditItem(item)}
                  className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-700 transition-all"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => toggleActive(item)}
                  className="p-1.5 rounded-lg text-zinc-600 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                >
                  <PauseCircle size={13} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* In pausa */}
      {inactive.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-1">In pausa</p>
          {inactive.map(item => (
            <Card key={item.id} className="p-0 overflow-hidden opacity-50">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-zinc-800 shrink-0">
                  <RefreshCw size={16} className="text-zinc-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-400 truncate">{item.name}</p>
                  <p className="text-xs text-zinc-600">{formatCurrency(item.amount, currency)}</p>
                </div>
                <button
                  onClick={() => toggleActive(item)}
                  className="p-1.5 rounded-lg text-zinc-600 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                >
                  <PlayCircle size={14} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modali */}
      {(showAdd || editItem) && (
        <AddRecurringModal
          categories={categories}
          currency={currency}
          editItem={editItem ?? undefined}
          onClose={() => { setShowAdd(false); setEditItem(null) }}
          onSuccess={() => { setShowAdd(false); setEditItem(null); router.refresh() }}
        />
      )}
    </>
  )
}
