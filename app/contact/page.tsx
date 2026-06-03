"use client"

import { useState } from "react"

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    const form = e.currentTarget
    const formData = new FormData(form)

    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    }

    const res = await fetch("/api/contact", {
      method: "POST",
      body: JSON.stringify(data),
    })

    setLoading(false)

    if (res.ok) {
      setSuccess(true)
      form.reset()
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">

      <h1 className="text-4xl font-bold mb-2">
        Contact
      </h1>

      <p className="text-gray-500 mb-10">
        Send us a message and we will respond as soon as possible.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">

        <input
          name="name"
          placeholder="Your name"
          className="w-full border p-4 rounded-xl"
          required
        />

        <input
          name="email"
          placeholder="Your email"
          type="email"
          className="w-full border p-4 rounded-xl"
          required
        />

        <textarea
          name="message"
          placeholder="Your message"
          className="w-full border p-4 rounded-xl h-40"
          required
        />

        <button
          disabled={loading}
          className="bg-black text-white px-6 py-4 rounded-xl w-full"
        >
          {loading ? "Sending..." : "Send message"}
        </button>

        {success && (
          <p className="text-green-600 text-center">
            Message sent successfully.
          </p>
        )}

      </form>

    </main>
  )
}