"use client"

import { useState } from "react"
import Link from "next/link"

const BRAND = '#00674d'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    setError("")

    const form = e.currentTarget
    const formData = new FormData(form)

    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        setSuccess(true)
        form.reset()
      } else {
        setError("The message could not be sent. Please try again, or email us directly.")
      }
    } catch {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* NAVBAR — provides the way back */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl text-white flex items-center justify-center font-bold text-lg"
              style={{ backgroundColor: BRAND }}
            >
              6σ
            </div>
            <div>
              <div className="font-bold text-lg leading-none">Six Sigma Macro Tools</div>
              <div className="text-xs text-gray-500">Six Sigma studies in your browser</div>
            </div>
          </Link>

          <Link
            href="/"
            className="text-sm border border-gray-300 hover:border-gray-900 px-5 py-2.5 rounded-2xl transition"
          >
            ← Back to home
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Breadcrumb */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition mb-8"
        >
          ← Home
        </Link>

        <h1 className="text-4xl font-bold mb-2">Contact</h1>

        <p className="text-gray-500 mb-10">
          Send a message and we will get back to you as soon as we can. You can also
          write directly to{" "}
          <a
            href="mailto:support@sixsigmamacrotools.com"
            className="underline hover:no-underline"
            style={{ color: BRAND }}
          >
            support@sixsigmamacrotools.com
          </a>
          .
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-3xl border shadow-sm">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Your name
            </label>
            <input
              id="name"
              name="name"
              placeholder="Jane Doe"
              className="w-full border p-4 rounded-xl outline-none focus:ring-2"
              style={{ boxShadow: 'none' }}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Your email
            </label>
            <input
              id="email"
              name="email"
              placeholder="you@company.com"
              type="email"
              className="w-full border p-4 rounded-xl outline-none focus:ring-2"
              required
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              Your message
            </label>
            <textarea
              id="message"
              name="message"
              placeholder="How can we help?"
              className="w-full border p-4 rounded-xl h-40 outline-none focus:ring-2"
              required
            />
          </div>

          <button
            disabled={loading}
            className="text-white px-6 py-4 rounded-xl w-full font-semibold disabled:opacity-50 transition"
            style={{ backgroundColor: BRAND }}
          >
            {loading ? "Sending..." : "Send message"}
          </button>

          {success && (
            <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center">
              <p className="text-green-700 font-medium">Message sent successfully.</p>
              <Link
                href="/"
                className="text-sm text-green-700 underline hover:no-underline mt-2 inline-block"
              >
                Back to home
              </Link>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}
        </form>

        <div className="mt-10 flex justify-center gap-6 text-sm text-gray-500">
          <Link href="/privacy" className="hover:text-gray-900 transition">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-gray-900 transition">Terms of Service</Link>
        </div>
      </div>
    </main>
  )
}
