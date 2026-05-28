import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CategoriesList } from '@/components/categories/CategoriesList'

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: categories } = await supabase
    .schema('finance')
    .from('categories')
    .select('*')
    .order('type')
    .order('name')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-100">Categorie</h1>
        <p className="text-sm text-zinc-500">Gestisci le tue categorie personalizzate</p>
      </div>
      <CategoriesList categories={categories ?? []} userId={user.id} />
    </div>
  )
}
