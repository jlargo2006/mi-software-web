'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-browser'

import { useSearchParams } from 'next/navigation'


export default function LoginPage() {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-sm">

        {/* TABS */}
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
    </div>
  )
}