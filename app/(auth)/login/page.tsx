'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) { setError(err.message); return }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-3xl overflow-hidden glow-emerald">
            <Image src="/icons/icon-512.png" alt="Finance logo" width={96} height={96} className="w-full h-full object-cover" priority />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-zinc-100">Finance PWA</h1>
            <p className="text-sm text-zinc-500 mt-1">Il tuo bilancio personale</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
          <Button type="submit" variant="primary" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          Non hai un account?{' '}
          <Link href="/signup" className="text-emerald-400 hover:text-emerald-300">
            Registrati
          </Link>
        </p>
      </div>
    </div>
  )
}
