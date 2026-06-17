// webhook handler.
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import { Resend } from 'resend'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const resend = new Resend(process.env.RESEND_API_KEY!)

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
    expiresAt.setDate(expiresAt.getDate() + 1)

    if (email) {
      const { data: users } = await supabase.auth.admin.listUsers()
      const user = users?.users.find(u => u.email === email)

      const license_key = randomUUID()

      const { error } = await supabase.from('subscriptions').upsert({
        user_id: user?.id ?? null,
        email,
        status: 'active',
        expires_at: expiresAt.toISOString(),
        license_key,
      }, { onConflict: 'email' })

      console.log('Supabase upsert result:', error ? error : 'OK')

      // Enviar email con la licencia
      await resend.emails.send({
        from: 'support@sixsigmamacrotools.com',
        to: email,
        subject: '🎉 Tu licencia de 6 Sigma Macro Tools',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #000;">¡Gracias por tu compra!</h1>
            <p>Tu licencia de <strong>6 Sigma Macro Tools</strong> está activa.</p>
            <p>Tu clave de licencia es:</p>
            <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <code style="font-size: 18px; font-weight: bold; letter-spacing: 2px;">${license_key}</code>
            </div>
            <p><strong>Cómo activar:</strong></p>
            <ol>
              <li>Abre Excel con 6 Sigma Macro Tools instalado</li>
              <li>En el ribbon, haz click en <strong>"Activar Licencia"</strong></li>
              <li>Introduce la clave de licencia</li>
            </ol>
            <p style="color: #666;">Tu licencia expira el: <strong>${expiresAt.toLocaleDateString('es-ES')}</strong></p>
            <hr/>
            <p style="color: #999; font-size: 12px;">
              Si tienes algún problema, contacta con nosotros en support@sixsigmamacrotools.com
            </p>
          </div>
        `
      })

      console.log('Email enviado a:', email)
    }
  }

  return NextResponse.json({ received: true })
}
