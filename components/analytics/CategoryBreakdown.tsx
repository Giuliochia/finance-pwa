import { formatCurrency } from '@/lib/utils'

interface CategoryBreakdownProps {
  expenses: { category: string; amount: number }[]
  currency: string
}

export function CategoryBreakdown({ expenses, currency }: CategoryBreakdownProps) {
  const total = expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="space-y-2">
      {expenses.map(({ category, amount }) => {
        const pct = total > 0 ? (amount / total) * 100 : 0
        return (
          <div key={category} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-300">{category}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-600">{pct.toFixed(0)}%</span>
                <span className="text-zinc-200 font-medium">{formatCurrency(amount, currency)}</span>
              </div>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500/60 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
