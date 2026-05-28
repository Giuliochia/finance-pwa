import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Transaction } from '@/lib/types'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface RecentTransactionsProps {
  transactions: Transaction[]
  currency?: string
}

export function RecentTransactions({ transactions, currency = 'EUR' }: RecentTransactionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ultime transazioni</CardTitle>
        <Link href="/transactions" className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300">
          Tutte <ArrowRight size={12} />
        </Link>
      </CardHeader>
      <div className="space-y-2">
        {transactions.length === 0 && (
          <p className="text-sm text-zinc-600 text-center py-6">Nessuna transazione questo mese</p>
        )}
        {transactions.slice(0, 5).map((tx) => (
          <div key={tx.id} className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs"
                style={{ backgroundColor: `${tx.category?.color ?? '#6b7280'}20`, color: tx.category?.color ?? '#6b7280' }}
              >
                {tx.category?.name?.charAt(0) ?? '?'}
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200">{tx.description || tx.category?.name || '—'}</p>
                <p className="text-xs text-zinc-600">{formatDate(tx.transaction_date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={tx.type}>{tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}</Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
