import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function DELETE() {
  try {
    const now = new Date(new Date().getTime() - 3 * 60 * 60 * 1000) // UTC-3
    const logs: string[] = []

    logs.push(`🕒 Hora actual ARG (UTC-3): ${now.toISOString()}`)

    const partidos = await prisma.partidos_club.findMany({
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        court: true,
        players: true,
        usuarios: true,
        clubId: true,
        price: true,
        categoria: true,
        genero: true,
        userId: true,
      },
    })

    logs.push(`📦 Total partidos encontrados: ${partidos.length}`)

    const partidosParaBorrar = partidos.filter((partido) => {
      const fecha = partido.date.toISOString().split("T")[0]
      const end = partido.startTime || "00:00"
      const [hh, mm] = end.split(":")
      const endDate = new Date(`${fecha}T${hh.padStart(2, '0')}:${mm.padStart(2, '0')}:00`)
      return endDate < now
    })

    logs.push(`🧹 Partidos vencidos: ${partidosParaBorrar.length}`)
    logs.push(`📝 IDs vencidos: ${partidosParaBorrar.map(p => p.id).join(', ')}`)

    const partidosCompletos = partidosParaBorrar.filter((p) => p.players === 4)
    logs.push(`✅ Partidos con 4 jugadores: ${partidosCompletos.length}`)

    for (const partido of partidosCompletos) {
  logs.push(`➡️ Procesando partido ${partido.id}...`)
  logs.push(`🧍 Usuarios: ${JSON.stringify(partido.usuarios)}`)

  try {
    const creado = await prisma.partidosConfirmados.upsert({
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
    logs.push(`✅ Partido confirmado guardado: ID ${creado.id}, matchId: ${creado.matchId}`)

    // 🔼 Actualización de partidosAgregar
    if (Array.isArray(partido.usuarios) && partido.usuarios.length > 0) {
      const userIds = partido.usuarios.filter((id) => typeof id === 'number' && !isNaN(id));

      logs.push(`🧮 IDs filtrados: ${userIds.join(', ')}`);

      const jugadores = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, firstName: true },
      });

      logs.push(`👥 Jugadores encontrados en DB: ${jugadores.length} / Esperados: ${userIds.length}`);

      if (jugadores.length < userIds.length) {
        const encontrados = new Set(jugadores.map(j => j.id));
        const faltantes = userIds.filter(id => !encontrados.has(id));
        logs.push(`⚠️ Usuarios no encontrados en la DB: ${faltantes.join(', ')}`);
      }

      for (const jugador of jugadores) {
        try {
          logs.push(`➡️ Incrementando partidosAgregar para userId=${jugador.id}`);
          await prisma.user.update({
            where: { id: jugador.id },
            data: {
              partidosAgregar: { increment: 1 },
            },
          });
          logs.push(`✅ Incremento exitoso para ${jugador.firstName} (ID ${jugador.id})`);
        } catch (err) {
          logs.push(`❌ Error al actualizar userId=${jugador.id}: ${err}`);
        }
      }

    } else {
      logs.push(`⚠️ usuarios vacío o no válido: ${JSON.stringify(partido.usuarios)}`);
    }


  } catch (error: unknown) {
    const mensaje = error instanceof Error ? error.message : JSON.stringify(error)
    logs.push(`❌ Error al guardar partido ${partido.id}: ${mensaje}`)
  }
}


    const idsAEliminar = partidosParaBorrar.map((p) => p.id)
    if (idsAEliminar.length > 0) {
      await prisma.partidos_club.deleteMany({
        where: { id: { in: idsAEliminar } },
      })
      logs.push(`🗑️ Partidos eliminados: ${idsAEliminar.length}`)
    } else {
      logs.push(`⚠️ No había partidos para eliminar`)
    }

    console.log(logs.join('\n'))
    return NextResponse.json({ eliminados: idsAEliminar.length, logs })
  } catch (error) {
    console.error('❌ Error general en cleanup:', error)
    return NextResponse.json({ error: 'Error al eliminar partidos pasados' }, { status: 500 })
  }
}
