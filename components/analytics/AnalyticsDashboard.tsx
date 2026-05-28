'use client'
import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import type { MonthlySummary, Transaction } from '@/lib/types'
import { Sparkles, TrendingDown, AlertCircle, Loader2 } from 'lucide-react'
import { MonthlyChart } from './MonthlyChart'
import { CategoryBreakdown } from './CategoryBreakdown'

interface AnalyticsDashboardProps {
  summaries: MonthlySummary[]
  transactions: Transaction[]
  currency: string
  savingsTarget: number
}

interface AISuggestion {
  category: string
  cut: number
  tip: string
}

interface AIResponse {
  summary: string
  suggestions: AISuggestion[]
}

export function AnalyticsDashboard({ summaries, transactions, currency, savingsTarget }: AnalyticsDashboardProps) {
  const [aiResult, setAiResult] = useState<AIResponse | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  const currentSummary = summaries[0]

  // Spese raggruppate per categoria del mese corrente
  const expensesByCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const tx of transactions) {
      const cat = tx.category?.name ?? 'Altro'
      map.set(cat, (map.get(cat) ?? 0) + tx.amount)
    }
    return Array.from(map.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
  }, [transactions])

  async function fetchAISuggestions() {
    if (!currentSummary) return
    setAiLoading(true)
    setAiError('')
    setAiResult(null)

    try {
      const res = await fetch('/api/ai-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: currentSummary,
          expenses: expensesByCategory,
          savingsTarget,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAiResult(data)
    } catch (e: unknown) {
      setAiError(e instanceof Error ? e.message : 'Errore sconosciuto')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Andamento mensile */}
      {summaries.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Andamento ultimi mesi</CardTitle>
          </CardHeader>
          <MonthlyChart summaries={summaries} currency={currency} />
        </Card>
      )}

      {/* Breakdown spese categoria */}
      {expensesByCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Spese per categoria — mese corrente</CardTitle>
          </CardHeader>
          <CategoryBreakdown expenses={expensesByCategory} currency={currency} />
        </Card>
      )}

      {/* Situazione risparmio */}
      {currentSummary && (
        <Card className={currentSummary.savings_gap >= 0 ? 'border-emerald-500/30' : 'border-red-500/30'}>
          <CardHeader>
            <CardTitle>Situazione risparmio</CardTitle>
            <TrendingDown size={16} className={currentSummary.savings_gap >= 0 ? 'text-emerald-400' : 'text-red-400'} />
          </CardHeader>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Saldo</span>
              <span className={currentSummary.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {formatCurrency(currentSummary.balance, currency)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Obiettivo</span>
              <span className="text-zinc-300">{formatCurrency(savingsTarget, currency)}</span>
            </div>
            <div className="h-px bg-zinc-800 my-1" />
            <div className="flex justify-between text-sm font-medium">
              <span className="text-zinc-400">Gap</span>
              <span className={currentSummary.savings_gap >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {currentSummary.savings_gap >= 0
                  ? `+${formatCurrency(currentSummary.savings_gap, currency)} in anticipo`
                  : `${formatCurrency(currentSummary.savings_gap, currency)} da colmare`}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* AI Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Suggerimenti AI</CardTitle>
          <Sparkles size={16} className="text-emerald-400" />
        </CardHeader>

        {!aiResult && !aiLoading && (
          <div className="space-y-3">
            <p className="text-sm text-zinc-500">
              Lascia che Grok AI analizzi le tue spese e suggerisca tagli specifici per raggiungere il tuo obiettivo di risparmio.
            </p>
            <Button
              variant="primary"
              onClick={fetchAISuggestions}
              disabled={!currentSummary || expensesByCategory.length === 0}
            >
              <Sparkles size={16} />
              Analizza con Grok AI
            </Button>
            {(!currentSummary || expensesByCategory.length === 0) && (
              <p className="text-xs text-zinc-600">Aggiungi qualche transazione questo mese per abilitare l&apos;analisi.</p>
            )}
          </div>
        )}

        {aiLoading && (
          <div className="flex items-center gap-3 py-4">
            <Loader2 size={18} className="text-emerald-400 animate-spin" />
            <p className="text-sm text-zinc-400">Grok sta analizzando le tue finanze...</p>
          </div>
        )}

        {aiError && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-400">{aiError}</p>
              <button onClick={fetchAISuggestions} className="text-xs text-red-400/70 hover:text-red-400 mt-1">
                Riprova
              </button>
            </div>
          </div>
        )}

        {aiResult && (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300 bg-zinc-800/50 rounded-xl p-3">{aiResult.summary}</p>
            <div className="space-y-2">
              {aiResult.suggestions.map((s, i) => (
                <div key={i} className="flex items-start gap-3 bg-zinc-800/30 rounded-xl p-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-zinc-200">{s.category}</p>
                      <span className="text-sm font-bold text-emerald-400">-{formatCurrency(s.cut, currency)}</span>
                    </div>
                    <p className="text-xs text-zinc-500">{s.tip}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={fetchAISuggestions}>
              <Sparkles size={14} />
              Rigenera
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
