import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import { Target } from 'lucide-react'

interface SavingsProgressProps {
  balance: number
  target: number
  currency?: string
}

export function SavingsProgress({ balance, target, currency = 'EUR' }: SavingsProgressProps) {
  const progress = Math.max(0, Math.min(100, (balance / target) * 100))
  const reached = balance >= target

  return (
    <Card>
      <CardHeader>
        <CardTitle>Obiettivo risparmio</CardTitle>
        <Target size={16} className="text-emerald-400" />
      </CardHeader>
      <div className="space-y-3">
        <div className="flex items-end justify-between">
          <span className="text-2xl font-bold text-zinc-100">{formatCurrency(balance, currency)}</span>
          <span className="text-sm text-zinc-500">/ {formatCurrency(target, currency)}</span>
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
