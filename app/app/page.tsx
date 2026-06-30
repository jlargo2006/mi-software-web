'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useAuth } from '@/lib/auth-provider'
import { supabase } from '@/lib/supabase-browser'

// Carga del analyzer solo en cliente (necesario para Plotly)
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
    <div className="h-screen w-full overflow-hidden">
      <SixSigmaAnalyzer userEmail={user.email ?? undefined} onSignOut={logout} />
    </div>
  )
}
