// /app/api/eventos/[id]/join/route.ts

import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const eventoId = parseInt(params.id)
  const body = await request.json()
  const { nombrePareja1, nombrePareja2 } = body

  if (!nombrePareja1 || !nombrePareja2) {
    return NextResponse.json({ error: "Faltan los nombres de la pareja" }, { status: 400 })
  }

  try {
    const evento = await prisma.evento_club.findUnique({
      where: { id: eventoId },
    })

    if (!evento) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 })
    }

    const nuevasParejas = [...evento.parejas, `${nombrePareja1} - ${nombrePareja2}`]

    if (evento.maxParejas && nuevasParejas.length > evento.maxParejas) {
      return NextResponse.json({ error: "El evento ya está completo" }, { status: 400 })
    }

    await prisma.evento_club.update({
      where: { id: eventoId },
      data: {
        parejas: nuevasParejas,
      },
    })

    return NextResponse.json({ message: "Pareja registrada exitosamente" })
  } catch (error) {
    console.error("Error al registrar pareja:", error)
    return NextResponse.json({ error: "Error interno al unirse al evento" }, { status: 500 })
  }
}
