'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useAuth } from '@/lib/auth-provider'
import { supabase } from '@/lib/supabase-browser'

// Carga del analyzer solo en cliente (necesario para Plotly más adelante)
const SixSigmaAnalyzer = dynamic(
  () => import('./six-sigma/SixSigmaAnalyzer'),
  {
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center text-gray-500">
        Cargando herramienta…
      </div>
    ),
  }
)

export default function AppPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  async function logout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        Cargando...
      </div>
    )
  if (!user) return null

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      {/* Barra de usuario (sesión + logout) por encima de la herramienta */}
      <div className="flex items-center justify-between bg-gray-900 text-white px-4 py-1.5 text-sm shrink-0">
        <span className="text-gray-300">
          Sesión activa:{' '}
          <span className="font-medium text-white">{user.email}</span>
        </span>
        <button
          onClick={logout}
          className="bg-white/15 hover:bg-white/25 px-3 py-1 rounded"
        >
          Cerrar sesión
        </button>
      </div>

      {/* La herramienta ocupa el resto de la pantalla */}
      <div className="flex-1 min-h-0">
        <SixSigmaAnalyzer />
      </div>
    </div>
  )
}
