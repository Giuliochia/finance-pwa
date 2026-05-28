import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'
import { currentYearMonth } from '@/lib/utils'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { year, month } = currentYearMonth()

  const [summariesRes, transactionsRes, profileRes] = await Promise.all([
    supabase.schema('finance').from('monthly_summaries')
      .select('*')
      .eq('user_id', user.id)
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(6),
    supabase.schema('finance').from('transactions')
      .select('*, category:categories(*)')
      .eq('user_id', user.id)
      .gte('transaction_date', `${year}-${String(month).padStart(2, '0')}-01`)
      .eq('type', 'expense'),
    supabase.schema('finance').from('profiles')
      .select('currency, savings_target')
      .eq('id', user.id)
      .single(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-100">Analytics</h1>
        <p className="text-sm text-zinc-500">Analisi e suggerimenti AI</p>
      </div>

      <AnalyticsDashboard
        summaries={summariesRes.data ?? []}
        transactions={transactionsRes.data ?? []}
        currency={profileRes.data?.currency ?? 'EUR'}
        savingsTarget={profileRes.data?.savings_target ?? 500}
      />
    </div>
  )
}
