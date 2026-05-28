'use client'
import { useState } from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import { Target, Pencil, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface SavingsProgressProps {
  balance: number
  target: number
  currency?: string
}

export function SavingsProgress({ balance, target, currency = 'EUR' }: SavingsProgressProps) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(String(target))
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const progress = Math.max(0, Math.min(100, (balance / target) * 100))
  const reached = balance >= target

  async function handleSave() {
    const parsed = parseFloat(value)
    if (isNaN(parsed) || parsed <= 0) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.schema('finance').from('profiles')
        .update({ savings_target: parsed })
        .eq('id', user.id)
    }
    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  function handleCancel() {
    setValue(String(target))
    setEditing(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Obiettivo risparmio</CardTitle>
        <div className="flex items-center gap-2">
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="p-1 rounded-lg text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
              title="Modifica obiettivo"
            >
              <Pencil size={14} />
            </button>
          )}
          <Target size={16} className="text-emerald-400" />
        </div>
      </CardHeader>

      <div className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <span className="text-2xl font-bold text-zinc-100">{formatCurrency(balance, currency)}</span>

          {editing ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-zinc-800 border border-emerald-500/50 rounded-lg px-2 py-1">
                <span className="text-zinc-500 text-sm mr-1">€</span>
                <input
                  type="number"
                  min="1"
                  step="50"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-24 bg-transparent text-sm text-zinc-100 focus:outline-none"
                  autoFocus
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all"
              >
                <Check size={14} />
              </button>
              <button
                onClick={handleCancel}
                className="p-1.5 rounded-lg bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700 transition-all"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <span className="text-sm text-zinc-500">/ {formatCurrency(target, currency)}</span>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${reached ? 'bg-emerald-500 glow-emerald' : 'bg-emerald-600'}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-xs text-zinc-500">
          {reached
            ? `Obiettivo raggiunto! +${formatCurrency(balance - target, currency)}`
            : `Mancano ${formatCurrency(target - balance, currency)} all'obiettivo`}
        </p>
      </div>
    </Card>
  )
}
