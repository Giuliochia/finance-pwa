'use client'
import { formatCurrency } from '@/lib/utils'
import type { MonthlySummary } from '@/lib/types'

const MONTH_NAMES = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']

interface MonthlyChartProps {
  summaries: MonthlySummary[]
  currency: string
}

export function MonthlyChart({ summaries, currency }: MonthlyChartProps) {
  const reversed = [...summaries].reverse()
  const maxVal = Math.max(...reversed.map(s => Math.max(s.total_income, s.total_expense)), 1)

  return (
    <div className="space-y-3">
      {/* Barre */}
      <div className="flex items-end gap-2 h-32">
        {reversed.map((s) => {
          const incomeH = (s.total_income / maxVal) * 100
          const expenseH = (s.total_expense / maxVal) * 100
          return (
            <div key={`${s.year}-${s.month}`} className="flex-1 flex flex-col items-center gap-1">
              <div className="flex items-end gap-0.5 h-24 w-full">
                <div
                  className="flex-1 bg-emerald-500/70 rounded-t-sm transition-all"
                  style={{ height: `${incomeH}%` }}
                  title={`Entrate: ${formatCurrency(s.total_income, currency)}`}
                />
                <div
                  className="flex-1 bg-red-500/70 rounded-t-sm transition-all"
                  style={{ height: `${expenseH}%` }}
                  title={`Uscite: ${formatCurrency(s.total_expense, currency)}`}
                />
              </div>
              <span className="text-[10px] text-zinc-600">{MONTH_NAMES[s.month - 1]}</span>
            </div>
          )
        })}
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-4 text-xs text-zinc-500">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/70" />
          Entrate
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-red-500/70" />
          Uscite
        </div>
      </div>
    </div>
  )
}
