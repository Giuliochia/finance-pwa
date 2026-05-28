'use client'
import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import type { Category, TransactionType } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Pencil, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const COLORS = [
  '#10b981','#34d399','#f97316','#ef4444','#8b5cf6',
  '#06b6d4','#eab308','#ec4899','#f59e0b','#6366f1',
  '#14b8a6','#a855f7','#3b82f6','#6b7280',
]

interface CategoriesListProps {
  categories: Category[]
  userId: string
}

interface FormState {
  name: string
  type: TransactionType
  color: string
  icon: string
}

const empty: FormState = { name: '', type: 'expense', color: '#10b981', icon: '' }

export function CategoriesList({ categories, userId }: CategoriesListProps) {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(empty)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const system = categories.filter(c => c.is_system)
  const custom = categories.filter(c => !c.is_system)
  const incomeCustom = custom.filter(c => c.type === 'income')
  const expenseCustom = custom.filter(c => c.type === 'expense')

  function startEdit(cat: Category) {
    setEditId(cat.id)
    setForm({ name: cat.name, type: cat.type, color: cat.color ?? '#10b981', icon: cat.icon ?? '' })
    setShowForm(false)
  }

  function startAdd() {
    setEditId(null)
    setForm(empty)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Il nome è obbligatorio'); return }
    setError('')
    setLoading(true)

    if (editId) {
      await supabase.schema('finance').from('categories')
        .update({ name: form.name, type: form.type, color: form.color, icon: form.icon || null })
        .eq('id', editId)
    } else {
      await supabase.schema('finance').from('categories')
        .insert({ name: form.name, type: form.type, color: form.color, icon: form.icon || null, user_id: userId })
    }

    setLoading(false)
    setShowForm(false)
    setEditId(null)
    setForm(empty)
    router.refresh()
  }

  async function handleDelete(id: string) {
    await supabase.schema('finance').from('categories').delete().eq('id', id)
    router.refresh()
  }

  function CategoryRow({ cat }: { cat: Category }) {
    const isEditing = editId === cat.id
    return (
      <div className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/30 transition-colors group">
        <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold"
          style={{ backgroundColor: `${cat.color ?? '#6b7280'}25`, color: cat.color ?? '#6b7280' }}>
          {cat.name.charAt(0)}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="flex-1 bg-zinc-800 border border-emerald-500/50 rounded-lg px-2 py-1 text-sm text-zinc-100 focus:outline-none"
              autoFocus
            />
            <div className="flex gap-1 flex-wrap">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={cn('w-4 h-4 rounded-full transition-transform', form.color === c && 'scale-125 ring-2 ring-white/50')}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
            <button type="submit" disabled={loading} className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded-lg">
              <Check size={14} />
            </button>
            <button type="button" onClick={() => setEditId(null)} className="p-1 text-zinc-500 hover:bg-zinc-700 rounded-lg">
              <X size={14} />
            </button>
          </form>
        ) : (
          <>
            <span className="flex-1 text-sm text-zinc-200">{cat.name}</span>
            {!cat.is_system && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(cat)} className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700 rounded-lg">
                  <Pencil size={13} />
                </button>
                <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg">
                  <Trash2 size={13} />
                </button>
              </div>
            )}
            {cat.is_system && <Badge variant="neutral">Sistema</Badge>}
          </>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" className="w-full" onClick={startAdd}>
        <Plus size={16} />
        Nuova categoria
      </Button>

      {/* Form nuova categoria */}
      {showForm && (
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-100">Nuova categoria</h3>

            <div className="flex gap-2 p-1 bg-zinc-800 rounded-xl">
              {(['expense', 'income'] as const).map(t => (
                <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                  className={cn('flex-1 py-1.5 rounded-lg text-xs font-medium transition-all',
                    form.type === t ? (t === 'income' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white') : 'text-zinc-500')}>
                  {t === 'income' ? 'Entrata' : 'Uscita'}
                </button>
              ))}
            </div>

            <Input label="Nome" placeholder="Es. Palestra, Affitti passivi..." value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Colore</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                    className={cn('w-7 h-7 rounded-full transition-transform border-2',
                      form.color === c ? 'scale-110 border-white/60' : 'border-transparent')}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex gap-2">
              <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowForm(false)}>Annulla</Button>
              <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
                {loading ? 'Salvataggio...' : 'Aggiungi'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Custom */}
      {custom.length > 0 && (
        <div className="space-y-4">
          {expenseCustom.length > 0 && (
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-1 mb-1">Uscite personalizzate</p>
              <Card className="p-0 overflow-hidden divide-y divide-zinc-800/50">
                {expenseCustom.map(c => <CategoryRow key={c.id} cat={c} />)}
              </Card>
            </div>
          )}
          {incomeCustom.length > 0 && (
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-1 mb-1">Entrate personalizzate</p>
              <Card className="p-0 overflow-hidden divide-y divide-zinc-800/50">
                {incomeCustom.map(c => <CategoryRow key={c.id} cat={c} />)}
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Sistema */}
      <div className="space-y-4">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-1">Categorie di sistema</p>
        <Card className="p-0 overflow-hidden divide-y divide-zinc-800/50">
          {system.map(c => <CategoryRow key={c.id} cat={c} />)}
        </Card>
      </div>
    </div>
  )
}
