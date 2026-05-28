import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatCard } from '@/components/dashboard/StatCard'
import { SavingsProgress } from '@/components/dashboard/SavingsProgress'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { AuditChecker } from '@/components/dashboard/AuditChecker'
import { QuickAddButton } from '@/components/dashboard/QuickAddButton'
import { currentYearMonth } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { year, month } = currentYearMonth()

  const [summaryRes, transactionsRes, recurringRes, profileRes] = await Promise.all([
    supabase.schema('finance').from('monthly_summaries')
      .select('*')
      .eq('year', year)
      .eq('month', month)
      .single(),
    supabase.schema('finance').from('transactions')
      .select('*, category:categories(*)')
      .eq('user_id', user.id)
      .gte('transaction_date', `${year}-${String(month).padStart(2, '0')}-01`)
      .order('transaction_date', { ascending: false })
      .limit(10),
    supabase.schema('finance').from('recurring_expenses')
      .select('*, category:categories(*)')
      .eq('user_id', user.id)
      .eq('is_active', true),
    supabase.schema('finance').from('profiles')
      .select('*')
      .eq('id', user.id)
      .single(),
  ])

  const summary = summaryRes.data
  const transactions = transactionsRes.data ?? []
  const recurring = recurringRes.data ?? []
  const profile = profileRes.data
  const currency = profile?.currency ?? 'EUR'
  const savingsTarget = profile?.savings_target ?? 500

  return (
    <div className="space-y-6">
      {/* Audit checker — mostra modal se ci sono abbonamenti da revisionare */}
      <AuditChecker recurring={recurring} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Dashboard</h1>
          <p className="text-sm text-zinc-500">
            {new Date().toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <QuickAddButton />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard label="Entrate" amount={summary?.total_income ?? 0} type="income" currency={currency} />
        <StatCard label="Uscite" amount={summary?.total_expense ?? 0} type="expense" currency={currency} />
        <div className="col-span-2 md:col-span-1">
          <StatCard label="Saldo" amount={summary?.balance ?? 0} type="balance" currency={currency} />
        </div>
      </div>

      {/* Savings progress */}
      <SavingsProgress
        balance={summary?.balance ?? 0}
        target={savingsTarget}
        currency={currency}
      />

      {/* Recent transactions */}
      <RecentTransactions transactions={transactions} currency={currency} />
    </div>
  )
}
