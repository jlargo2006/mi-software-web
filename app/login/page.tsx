'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase-browser'
import Link from 'next/link'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<'login' | 'register'>(
    searchParams.get('mode') === 'register' ? 'register' : 'login'
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push('/')
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Revisa tu email y confirma tu cuenta para poder iniciar sesión.')
      }
    }

    setLoading(false)
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-sm">

      <div className="flex mb-6 border rounded-xl overflow-hidden">
        <button
          onClick={() => { setMode('login'); setError(''); setMessage('') }}
          className={`flex-1 py-2.5 text-sm font-medium transition ${mode === 'login' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Iniciar sesión
        </button>
        <button
          onClick={() => { setMode('register'); setError(''); setMessage('') }}
          className={`flex-1 py-2.5 text-sm font-medium transition ${mode === 'register' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Registrarse
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {message && <p className="text-green-600 text-sm">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Registrarse'}
        </button>
      </form>

    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center font-bold text-lg">
              6σ
            </div>
            <div>
              <div className="font-bold text-lg leading-none">6 Sigma Macro Tools</div>
              <div className="text-xs text-gray-500">Statistical Excel Automation</div>
            </div>
          </Link>
        </div>
      </nav>

      {/* FORMULARIO */}
      <div className="flex-1 flex items-center justify-center">
        <Suspense fallback={<div className="text-sm text-gray-500">Cargando...</div>}>
          <LoginForm />
        </Suspense>
      </div>

    </div>
  )
}