import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const now = new Date()

    // Obtener todos los partidos
    const partidos = await prisma.partidos_club.findMany({
      where: {
        players: 4, // Partido lleno
      },
      include: { Club: true },
    })

    // Calcular información de tiempo para cada partido
    const partidosConTiempo = partidos.map((partido) => {
      // Convertir la fecha y hora del partido a un objeto Date
      const partidoDate = new Date(partido.date)
      const [hours, minutes] = partido.startTime.split(":").map(Number)
      partidoDate.setHours(hours, minutes, 0, 0)

      // Calcular la diferencia en horas
      const diffMs = partidoDate.getTime() - now.getTime()
      const diffHours = diffMs / (1000 * 60 * 60)

      return {
        id: partido.id,
        club: partido.Club.name,
        fecha: partido.date.toISOString().split("T")[0],
        hora: partido.startTime,
        fechaHoraCompleta: partidoDate.toISOString(),
        horasRestantes: diffHours.toFixed(2),
        jugadores: partido.usuarios.length,
        notificar24h: diffHours >= 23.5 && diffHours <= 24.5,
        notificar12h: diffHours >= 11.5 && diffHours <= 12.5,
      }
    })

    return NextResponse.json({
      horaActual: now.toISOString(),
      totalPartidos: partidos.length,
      partidos: partidosConTiempo,
    })
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Error desconocido"
    return NextResponse.json({ error: `Error en la API: ${errMessage}` }, { status: 500 })
  }
}

