import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyAuth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const eventoId = parseInt(params.id)
    const token = cookies().get('token')?.value
    const userId = await verifyAuth(token)

    if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

    const evento = await prisma.evento_club.findUnique({ where: { id: eventoId } })
    if (!evento) return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })

    const nombreUsuario = user.firstName 
    const nuevasParejas = evento.parejas.filter((p) => !p.includes(nombreUsuario))

    const inscripciones = Array.isArray(evento.inscripciones)
      ? (evento.inscripciones as number[])
      : []

    const nuevasInscripciones = inscripciones.filter((id) => id !== userId)

    const eventoActualizado = await prisma.evento_club.update({
      where: { id: eventoId },
      data: {
        parejas: nuevasParejas,
        inscripciones: nuevasInscripciones,
      },
    })

    return NextResponse.json(eventoActualizado)
  } catch (error) {
    console.error('Error al cancelar inscripción:', error)
    return NextResponse.json({ error: 'Error al cancelar inscripción' }, { status: 500 })
  }
}
