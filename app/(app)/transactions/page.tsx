import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TransactionsList } from '@/components/transactions/TransactionsList'
import { QuickAddButton } from '@/components/dashboard/QuickAddButton'

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [transactionsRes, categoriesRes, profileRes] = await Promise.all([
    supabase.schema('finance').from('transactions')
      .select('*, category:categories(*)')
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false })
      .limit(200),
    supabase.schema('finance').from('categories')
      .select('*')
      .order('name'),
    supabase.schema('finance').from('profiles')
      .select('currency')
      .eq('id', user.id)
      .single(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Transazioni</h1>
          <p className="text-sm text-zinc-500">Tutti i tuoi movimenti</p>
        </div>
        <QuickAddButton />
      </div>

      <TransactionsList
        transactions={transactionsRes.data ?? []}
        categories={categoriesRes.data ?? []}
        currency={profileRes.data?.currency ?? 'EUR'}
      />
    </div>
  )
}
