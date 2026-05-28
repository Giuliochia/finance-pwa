import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateStr))
}

export function currentYearMonth() {
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

/** Returns recurring expenses whose next_audit_at is in the past */
export function getDueAudits<T extends { next_audit_at: string | null; is_active: boolean }>(items: T[]): T[] {
  const now = new Date()
  return items.filter(i => i.is_active && i.next_audit_at && new Date(i.next_audit_at) <= now)
}

/** Compute spending cuts needed to hit savings target */
export function computeSuggestions(
  variableExpenses: Array<{ category: string; amount: number }>,
  gap: number,
): Array<{ category: string; amount: number; suggestedCut: number }> {
  if (gap >= 0) return []
  const needed = Math.abs(gap)
  const total = variableExpenses.reduce((s, e) => s + e.amount, 0)
  return variableExpenses
    .map(e => ({
      ...e,
      suggestedCut: total > 0 ? Math.ceil((e.amount / total) * needed * 100) / 100 : 0,
    }))
    .filter(e => e.suggestedCut > 0)
    .sort((a, b) => b.suggestedCut - a.suggestedCut)
}
