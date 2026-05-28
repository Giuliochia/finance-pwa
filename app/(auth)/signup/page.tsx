'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center glow-emerald">
            <span className="text-white font-bold text-xl">F</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100">Crea account</h1>
        </div>

        <form onSubmit={handleSignup} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <Input id="name" label="Nome" placeholder="Mario Rossi" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input id="email" label="Email" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          <Input id="password" label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
          {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
          <Button type="submit" variant="primary" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Registrazione...' : 'Registrati'}
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          Hai già un account?{' '}
          <Link href="/login" className="text-emerald-400 hover:text-emerald-300">Accedi</Link>
        </p>
      </div>
    </div>
  )
}
