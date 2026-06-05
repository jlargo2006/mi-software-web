'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-provider'
import { supabase } from '@/lib/supabase-browser'

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

  if (loading) return <div className="h-screen flex items-center justify-center">Cargando...</div>
  if (!user) return null

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <p className="mb-2 text-gray-600">Sesión activa: <span className="font-medium text-black">{user.email}</span></p>
      <button
        onClick={logout}
        className="mt-6 bg-black text-white px-6 py-3 rounded-xl"
      >
        Cerrar sesión
      </button>
    </div>
  )
}