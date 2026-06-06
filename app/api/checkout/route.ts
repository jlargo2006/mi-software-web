import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST() {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [
      {
        price: 'price_1TfMvpRu0NVWSHF7akW4XJ0Y',
        quantity: 1,
      },
    ],
    success_url: 'https://mi-software-web.vercel.app/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://mi-software-web.vercel.app/',
  })

  return NextResponse.json({ url: session.url })
}