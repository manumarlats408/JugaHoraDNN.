import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function DELETE() {
  try {
    const now = new Date(new Date().getTime() - 3 * 60 * 60 * 1000) // UTC-3
    const logs: string[] = []

    logs.push(`🕒 Hora actual ARG (UTC-3): ${now.toISOString()}`)

    // Obtener todos los partidos
    const partidos = await prisma.partidos_club.findMany()

    // Filtrar los que ya pasaron en el tiempo
    const partidosParaBorrar = partidos.filter((partido) => {
      const fecha = partido.date.toISOString().split("T")[0]
      const end = partido.startTime || "00:00"
      const [hh, mm] = end.split(":")
      const endDate = new Date(`${fecha}T${hh.padStart(2, '0')}:${mm.padStart(2, '0')}:00`)
      return endDate < now
    })

    // Filtrar partidos con 4 jugadores
    const partidosCompletos = partidosParaBorrar.filter((p) => p.players === 4)

    // Guardar partidos confirmados antes de eliminarlos
    for (const partido of partidosCompletos) {
      try {
        await prisma.partidosConfirmados.upsert({
          where: { matchId: partido.id },
          create: {
            matchId: partido.id,
            date: partido.date,
            startTime: partido.startTime,
            endTime: partido.endTime,
            court: partido.court,
            usuarios: partido.usuarios,
            clubId: partido.clubId,
            price: partido.price,
            categoria: partido.categoria,
            genero: partido.genero,
            userId: partido.userId ?? null,
          },
          update: {
            // Por si ya estaba registrado y se actualiza
            date: partido.date,
            startTime: partido.startTime,
            endTime: partido.endTime,
            court: partido.court,
            usuarios: partido.usuarios,
            clubId: partido.clubId,
            price: partido.price,
            categoria: partido.categoria,
            genero: partido.genero,
            userId: partido.userId ?? null,
          },
        })
        logs.push(`✅ Partido confirmado: ID ${partido.id}`)
      } catch (error) {
        logs.push(`⚠️ Error al guardar partido confirmado ID ${partido.id}: ${error}`)
      }
    }

    // Eliminar partidos
    const idsAEliminar = partidosParaBorrar.map((p) => p.id)
    if (idsAEliminar.length > 0) {
      await prisma.partidos_club.deleteMany({
        where: { id: { in: idsAEliminar } },
      })
    }

    logs.push(`🗑️ Partidos eliminados: ${idsAEliminar.length}`)
    console.log(logs.join('\n'))

    return NextResponse.json({ eliminados: idsAEliminar.length, logs })
  } catch (error) {
    console.error('❌ Error al eliminar partidos pasados:', error)
    return NextResponse.json({ error: 'Error al eliminar partidos pasados' }, { status: 500 })
  }
}
