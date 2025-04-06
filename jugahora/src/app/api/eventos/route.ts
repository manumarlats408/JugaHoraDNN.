import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string);

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      nombre,
      date,
      startTime,
      endTime,
      clubId,
      categoria,
      genero,
      tipo,
      maxParejas,
      formato,
      price,
    } = data;

    const nuevoEvento = await prisma.evento_club.create({
      data: {
        nombre,
        date: new Date(date),
        startTime,
        endTime,
        categoria,
        genero,
        tipo,
        maxParejas: Number(maxParejas),
        price: parseFloat(price),
        ...(tipo === "torneo" && { formato }),
        Club: {
          connect: { id: clubId }
        }
      },
      include: { Club: true },
    });

    // 🔔 Notificar a jugadores de categoría +/-1
    const cat = parseInt(categoria);
    const niveles = [cat - 1, cat, cat + 1].map(String); // convertimos a string si nivel es string
    const jugadores = await prisma.user.findMany({
      where: {
        nivel: { in: niveles },
      },
      select: { email: true, firstName: true },
    });

    for (const jugador of jugadores) {
      await sendgrid.send({
        to: jugador.email,
        from: process.env.SENDGRID_FROM_EMAIL as string,
        subject: "🎾 ¡Nuevo evento disponible!",
        html: `
          <h2>🎾 ¡Nuevo evento en ${nuevoEvento.Club.name}!</h2>
          <p>Hola ${jugador.firstName || "jugador"},</p>
          <p>Se ha creado un nuevo evento que puede interesarte.</p>
          <h3>📅 Detalles del Evento:</h3>
          <ul>
            <li><strong>Nombre:</strong> ${nuevoEvento.nombre}</li>
            <li><strong>Fecha:</strong> ${new Date(nuevoEvento.date).toISOString().split("T")[0]}</li>
            <li><strong>Horario:</strong> ${startTime} - ${endTime}</li>
            <li><strong>Género:</strong> ${genero}</li>
            <li><strong>Categoría:</strong> ${categoria}</li>
            <li><strong>Tipo:</strong> ${tipo}</li>
          </ul>
          <p>Podés unirte desde la plataforma en la sección de eventos.</p>
          <p>¡Te esperamos en la cancha!</p>
        `,
      });
    }

    return NextResponse.json(nuevoEvento, { status: 201 });
  } catch (error) {
    console.error("Error al crear evento:", error);
    return NextResponse.json({ error: "Error al crear el evento" }, { status: 500 });
  }
}


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const clubId = searchParams.get("clubId")

  try {
    const eventos = await prisma.evento_club.findMany({
      where: clubId ? { clubId: Number(clubId) } : {},
      include: {
        Club: true,
      },
      orderBy: { date: "asc" },
    })

    // Asegurar que `inscripciones` siempre sea un array
    const eventosConInscripciones = eventos.map(evento => ({
      ...evento,
      inscripciones: evento.inscripciones || [], // Esto previene `undefined`
    }))

    return NextResponse.json(eventosConInscripciones)
  } catch (error) {
    console.error("Error al obtener eventos:", error)
    return NextResponse.json({ error: "Error al obtener eventos" }, { status: 500 })
  }
}
