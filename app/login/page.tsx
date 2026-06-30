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
  const [showPassword, setShowPassword] = useState(false)
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
        router.push('/app') // ← zona privada (mejora 4)
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else if (data.user && data.user.identities && data.user.identities.length === 0) {
        // Mejora 1: email ya registrado (Supabase devuelve identities vacío)
        setError('Este email ya está registrado. Inicia sesión o recupera tu contraseña.')
      } else {
        setMessage('Revisa tu email y confirma tu cuenta para poder iniciar sesión.')
      }

    }

    setLoading(false)
  }

  async function handleForgotPassword() {
    setError('')
    setMessage('')

    if (!email) {
      setError('Escribe tu email arriba y pulsa de nuevo "He olvidado mi contraseña".')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`, // ← mismo dominio (mejora 4)
    })
    if (error) {
      setError(error.message)
    } else {
      setMessage('Te hemos enviado un correo para restablecer tu contraseña.')
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

        {/* Mejora 2: ver/ocultar contraseña */}
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black w-full pr-16"
          />
          <button
            type="button"
            onClick={() => setShowPassword(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-black"
          >
            {showPassword ? 'Ocultar' : 'Ver'}
          </button>
        </div>

        {/* Mejora 3: olvido de contraseña (solo en modo login) */}
        {mode === 'login' && (
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-xs text-gray-500 hover:text-black text-left -mt-2"
          >
            He olvidado mi contraseña
          </button>
        )}

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
