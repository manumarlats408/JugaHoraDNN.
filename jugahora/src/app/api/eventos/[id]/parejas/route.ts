import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const eventoId = parseInt(params.id)

    const evento = await prisma.evento_club.findUnique({
      where: { id: eventoId },
      select: { parejas: true },
    })

    if (!evento) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })
    }

    const parejasEnumeradas = evento.parejas.map((pareja, i) => {
      const [j1, j2] = pareja.split('/')
      return `${i + 1}) ${j1} - ${j2}`
    })

    return NextResponse.json(parejasEnumeradas)
  } catch (error) {
    console.error('Error al obtener parejas del evento:', error)
    return NextResponse.json({ error: 'Error al obtener parejas' }, { status: 500 })
  }
}
