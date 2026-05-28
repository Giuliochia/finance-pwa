'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import type { RecurringExpense } from '@/lib/types'
import { AlertTriangle, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AuditModalProps {
  expense: RecurringExpense
  onDone: () => void
}

export function AuditModal({ expense, onDone }: AuditModalProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleAction(action: 'kept' | 'removed') {
    setLoading(true)
    const supabaseClient = supabase

    await supabaseClient.from('finance.audit_notifications').insert({
      recurring_expense_id: expense.id,
      action,
    })

    if (action === 'removed') {
      await supabaseClient
        .schema('finance')
        .from('recurring_expenses')
        .update({ is_active: false })
        .eq('id', expense.id)
    } else {
      await supabaseClient
        .schema('finance')
        .from('recurring_expenses')
        .update({
          last_audit_at: new Date().toISOString(),
          next_audit_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq('id', expense.id)
    }

    setLoading(false)
    onDone()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/15">
            <AlertTriangle size={20} className="text-amber-400" />
          </div>
          <div>
            <h2 className="font-semibold text-zinc-100">Audit abbonamento</h2>
            <p className="text-sm text-zinc-500 mt-0.5">Revisione mensile richiesta</p>
          </div>
        </div>

        {/* Expense info */}
        <div className="bg-zinc-800/50 rounded-xl p-4 space-y-1">
          <p className="font-medium text-zinc-100">{expense.name}</p>
          <p className="text-lg font-bold text-zinc-100">{formatCurrency(expense.amount)}/mese</p>
          {expense.notes && <p className="text-sm text-zinc-500">{expense.notes}</p>}
        </div>

        <p className="text-sm text-zinc-400">
          Questo abbonamento è ancora necessario o può essere rimosso?
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => handleAction('removed')}
            disabled={loading}
          >
            <X size={16} />
            Rimuovi
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => handleAction('kept')}
            disabled={loading}
          >
            <Check size={16} />
            Tengo
          </Button>
        </div>
      </div>
    </div>
  )
}
