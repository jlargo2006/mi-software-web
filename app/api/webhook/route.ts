// webhook handler
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature error:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const email = session.customer_details?.email
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 1) // 1 día por ahora

    if (email) {
      // Buscar el user_id en Supabase por email
      const { data: users } = await supabase.auth.admin.listUsers()
      const user = users?.users.find(u => u.email === email)

      await supabase.from('subscriptions').upsert({
        user_id: user?.id ?? null,
        email,
        status: 'active',
        expires_at: expiresAt.toISOString(),
      }, { onConflict: 'email' })
    }
  }

  return NextResponse.json({ received: true })
}