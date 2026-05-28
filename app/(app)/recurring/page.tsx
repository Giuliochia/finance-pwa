import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RecurringList } from '@/components/recurring/RecurringList'

export default async function RecurringPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [recurringRes, categoriesRes, profileRes] = await Promise.all([
    supabase.schema('finance').from('recurring_expenses')
      .select('*, category:categories(*)')
      .eq('user_id', user.id)
      .order('name'),
    supabase.schema('finance').from('categories')
      .select('*')
      .eq('type', 'expense')
      .order('name'),
    supabase.schema('finance').from('profiles')
      .select('currency')
      .eq('id', user.id)
      .single(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-100">Spese ricorrenti</h1>
        <p className="text-sm text-zinc-500">Abbonamenti e spese fisse mensili</p>
      </div>

      <RecurringList
        recurring={recurringRes.data ?? []}
        categories={categoriesRes.data ?? []}
        currency={profileRes.data?.currency ?? 'EUR'}
      />
    </div>
  )
}
