import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { name, email, message } = body

    if (!name || !email || !message) {
      return new Response("Missing fields", { status: 400 })
    }

    const data = await resend.emails.send({
      from: "Six Sigma Contact <onboarding@resend.dev>",
      to: ["sixsigmamacrotools@gmail.com"],
      subject: "New contact form message",
      replyTo: email,
      text: `
Name: ${name}
Email: ${email}

Message:
${message}
      `,
    })

    return Response.json({ success: true, data })
  } catch (error) {
    return new Response("Error sending email", { status: 500 })
  }
}