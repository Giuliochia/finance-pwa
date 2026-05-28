'use client'
import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Transaction, Category } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Trash2, ChevronDown } from 'lucide-react'

interface TransactionsListProps {
  transactions: Transaction[]
  categories: Category[]
  currency: string
}

export function TransactionsList({ transactions, categories, currency }: TransactionsListProps) {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Mesi disponibili dai dati
  const availableMonths = useMemo(() => {
    const months = new Set(transactions.map(t => t.transaction_date.slice(0, 7)))
    return Array.from(months).sort().reverse()
  }, [transactions])

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (filterType !== 'all' && t.type !== filterType) return false
      if (filterCategory && t.category_id !== filterCategory) return false
      if (filterMonth && !t.transaction_date.startsWith(filterMonth)) return false
      return true
    })
  }, [transactions, filterType, filterCategory, filterMonth])

  const totals = useMemo(() => ({
    income: filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    expense: filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
  }), [filtered])

  async function handleDelete(id: string) {
    setDeleting(id)
    await supabase.schema('finance').from('transactions').delete().eq('id', id)
    setDeleting(null)
    router.refresh()
  }

  // Raggruppa per data
  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>()
    for (const t of filtered) {
      const key = t.transaction_date
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(t)
    }
    return Array.from(map.entries())
  }, [filtered])

  return (
    <div className="space-y-4">
      {/* Filtri */}
      <Card className="p-3">
        <div className="flex flex-wrap gap-2">
          {/* Tipo */}
          <div className="flex gap-1 p-1 bg-zinc-800 rounded-lg">
            {(['all', 'income', 'expense'] as const).map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  filterType === t ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {t === 'all' ? 'Tutti' : t === 'income' ? 'Entrate' : 'Uscite'}
              </button>
            ))}
          </div>

          {/* Mese */}
          <div className="relative">
            <select
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              className="appearance-none pl-3 pr-7 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="">Tutti i mesi</option>
              {availableMonths.map(m => (
                <option key={m} value={m}>
                  {new Date(m + '-01').toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          </div>

          {/* Categoria */}
          <div className="relative">
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="appearance-none pl-3 pr-7 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="">Tutte le categorie</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          </div>
        </div>
      </Card>

      {/* Totali filtrati */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
          <p className="text-xs text-zinc-500 mb-1">Entrate</p>
          <p className="text-lg font-bold text-emerald-400">{formatCurrency(totals.income, currency)}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
          <p className="text-xs text-zinc-500 mb-1">Uscite</p>
          <p className="text-lg font-bold text-red-400">{formatCurrency(totals.expense, currency)}</p>
        </div>
      </div>

      {/* Lista raggruppata per data */}
      {grouped.length === 0 && (
        <Card>
          <p className="text-sm text-zinc-600 text-center py-8">Nessuna transazione trovata</p>
        </Card>
      )}

      {grouped.map(([date, txs]) => (
        <div key={date} className="space-y-1">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-1">
            {formatDate(date)}
          </p>
          <Card className="p-0 overflow-hidden divide-y divide-zinc-800/50">
            {txs.map(tx => (
              <div key={tx.id} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/30 transition-colors group">
                {/* Icona categoria */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-medium shrink-0"
                  style={{
                    backgroundColor: `${tx.category?.color ?? '#6b7280'}18`,
                    color: tx.category?.color ?? '#6b7280',
                  }}
                >
                  {tx.category?.name?.charAt(0) ?? '?'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200 truncate">
                    {tx.description || tx.category?.name || 'Transazione'}
                  </p>
                  <p className="text-xs text-zinc-600">{tx.category?.name}</p>
                </div>

                {/* Importo */}
                <Badge variant={tx.type}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                </Badge>

                {/* Elimina */}
                <button
                  onClick={() => handleDelete(tx.id)}
                  disabled={deleting === tx.id}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </Card>
        </div>
      ))}
    </div>
  )
}
