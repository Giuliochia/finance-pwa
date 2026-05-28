import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  amount: number
  type: 'income' | 'expense' | 'balance'
  currency?: string
}

export function StatCard({ label, amount, type, currency = 'EUR' }: StatCardProps) {
  const isPositive = amount >= 0
  const Icon = type === 'income' ? TrendingUp : type === 'expense' ? TrendingDown : isPositive ? TrendingUp : TrendingDown

  const colorMap = {
    income:  'text-emerald-400',
    expense: 'text-red-400',
    balance: isPositive ? 'text-emerald-400' : 'text-red-400',
  }

  const bgMap = {
    income:  'bg-emerald-500/10 border-emerald-500/20',
    expense: 'bg-red-500/10 border-red-500/20',
    balance: isPositive ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20',
  }

  return (
    <Card className={cn('border', bgMap[type])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
          <p className={cn('text-2xl font-bold', colorMap[type])}>
            {formatCurrency(amount, currency)}
          </p>
        </div>
        <div className={cn('p-2 rounded-lg', bgMap[type])}>
          <Icon size={18} className={colorMap[type]} />
        </div>
      </div>
    </Card>
  )
}
