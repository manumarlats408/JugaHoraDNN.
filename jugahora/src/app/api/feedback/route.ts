import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json()

    // Validar los datos
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    // Aquí iría la lógica para enviar el email usando SendGrid
    // Este es un ejemplo básico, necesitarías configurar SendGrid adecuadamente
    const sendgridUrl = "https://api.sendgrid.com/v3/mail/send"
    const response = await fetch(sendgridUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: process.env.SENDGRID_FROM_EMAIL }],
            subject: "Nuevo feedback de JugáHora",
          },
        ],
        from: { email: process.env.SENDGRID_FROM_EMAIL },
        reply_to: { email: email },
        content: [
          {
            type: "text/plain",
            value: `Nombre: ${name}\nEmail: ${email}\nMensaje: ${message}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("Error al enviar email:", error)
      return NextResponse.json({ error: "Error al enviar el feedback" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error en el servidor:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}

