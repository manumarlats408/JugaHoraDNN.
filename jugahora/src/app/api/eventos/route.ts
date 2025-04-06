import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import sendgrid from "@sendgrid/mail"

sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string)

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const {
      nombre,
      date,
      startTime,
      endTime,
      clubId,
      categoria: categoriaStr,
      genero,
      tipo,
      maxParejas,
      formato,
      price,
    } = data

    const categoria = parseInt(categoriaStr)

    // 🔹 Crear el evento
    const nuevoEvento = await prisma.evento_club.create({
      data: {
        nombre,
        date: new Date(date),
        startTime,
        endTime,
        categoria: categoria.toString(), // Se guarda como string si tu columna es text
        genero,
        tipo,
        maxParejas: Number(maxParejas),
        price: parseFloat(price),
        ...(tipo === "torneo" && { formato }),
        Club: {
          connect: { id: Number(clubId) },
        },
      },
      include: {
        Club: true,
      },
    })

    // 🔹 Convertir niveles a strings si `nivel` en la base de datos es string
    const niveles = [categoria - 1, categoria, categoria + 1].map(String)

    const jugadoresNotificar = await prisma.user.findMany({
      where: {
        nivel: {
          in: niveles,
        },
      },
      select: {
        email: true,
        firstName: true,
      },
    })

    for (const jugador of jugadoresNotificar) {
      await sendgrid.send({
        to: jugador.email,
        from: process.env.SENDGRID_FROM_EMAIL as string,
        subject: `🎾 Nuevo Evento para tu nivel: ${nombre}`,
        html: `
          <h2>🎾 ¡Nuevo Evento Disponible!</h2>
          <p>Hola ${jugador.firstName || "jugador"},</p>
          <p>Hay un nuevo evento en <strong>${nuevoEvento.Club.name}</strong> que coincide con tu nivel (${categoria}):</p>
          <h3>📅 Detalles del Evento:</h3>
          <ul>
            <li><strong>Nombre:</strong> ${nombre}</li>
            <li><strong>📆 Fecha:</strong> ${new Date(date).toISOString().split("T")[0]}</li>
            <li><strong>⏰ Hora:</strong> ${startTime} - ${endTime}</li>
            <li><strong>Género:</strong> ${genero}</li>
            <li><strong>Tipo:</strong> ${tipo}</li>
            ${tipo === "torneo" ? `<li><strong>Formato:</strong> ${formato}</li>` : ""}
            <li><strong>Precio:</strong> $${price}</li>
          </ul>
          <p>¡Unite al evento desde la plataforma!</p>
          <p style="font-size: 12px; color: #888;">JugáHora</p>
        `,
      })
    }

    return NextResponse.json(nuevoEvento, { status: 201 })
  } catch (error) {
    console.error("Error al crear evento:", error)
    return NextResponse.json({ error: "Error al crear el evento" }, { status: 500 })
  }
}
