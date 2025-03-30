import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const eventoId = parseInt(params.id)

    const evento = await prisma.evento_club.findUnique({
      where: { id: eventoId },
      select: {
        tipo: true,
        parejas: true,
      },
    })

    if (!evento) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })
    }

    if (evento.tipo === 'cancha_abierta') {
      const userIds = evento.parejas
        .map((idStr) => parseInt(idStr))
        .filter((id) => !isNaN(id))

      const usuarios = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, firstName: true, lastName: true},
      })

      const nombres = usuarios.map((u, i) => {
        const nombreCompleto = u.firstName || `Jugador ${u.id}`
        return `${i + 1}) ${nombreCompleto}`
      })

      return NextResponse.json(nombres)
    }

    // Evento tipo torneo
    const parejasEnumeradas = evento.parejas.map((pareja, i) => {
      const [j1, j2] = pareja.split('/')
      if (!j1 || !j2) {
        return `${i + 1}) ${pareja}`
      }
      return `${i + 1}) ${j1.trim()} - ${j2.trim()}`
    })

    return NextResponse.json(parejasEnumeradas)
  } catch (error) {
    console.error('Error al obtener parejas del evento:', error)
    return NextResponse.json({ error: 'Error al obtener parejas' }, { status: 500 })
  }
}
