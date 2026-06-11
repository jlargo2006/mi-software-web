import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const license_key = searchParams.get('license_key')

  if (!license_key) {
    return NextResponse.json({ valid: false, reason: 'No license key provided' })
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .select('status, expires_at')
    .eq('license_key', license_key)
    .single()

  if (error || !data) {
    return NextResponse.json({ valid: false, reason: 'License not found' })
  }

  if (data.status !== 'active') {
    return NextResponse.json({ valid: false, reason: 'License inactive' })
  }

  const now = new Date()
  const expires = new Date(data.expires_at)

  if (now > expires) {
    // Marcar como expirada en Supabase
    await supabase
      .from('subscriptions')
      .update({ status: 'expired' })
      .eq('license_key', license_key)

    return NextResponse.json({ valid: false, reason: 'License expired' })
  }

  return NextResponse.json({ valid: true, expires_at: data.expires_at })
}