import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * 🔴 DELETE - Eliminar evento
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const eventoId = parseInt(params.id)

  try {
    const evento = await prisma.evento_club.findUnique({ where: { id: eventoId } })

    if (!evento) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })
    }

    await prisma.evento_club.delete({ where: { id: eventoId } })

    return NextResponse.json({ message: 'Evento eliminado correctamente' })
  } catch (error) {
    console.error('Error al eliminar el evento:', error)
    return NextResponse.json({ error: 'Error al eliminar el evento' }, { status: 500 })
  }
}

/**
 * ✏️ PATCH - Editar evento
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const eventoId = parseInt(params.id)

  try {
    const {
      nombre,
      date,
      startTime,
      endTime,
      categoria,
      genero,
      tipo,
      formato,
      maxParejas,
    } = await request.json()

    const eventoActualizado = await prisma.evento_club.update({
      where: { id: eventoId },
      data: {
        nombre,
        date: new Date(date),
        startTime,
        endTime,
        categoria,
        genero,
        tipo,
        formato: tipo === "torneo" ? formato : null,
        maxParejas: typeof maxParejas === "string" ? parseInt(maxParejas) : maxParejas,
      },
    })

    return NextResponse.json(eventoActualizado)
  } catch (error) {
    console.error('Error al actualizar el evento:', error)
    return NextResponse.json({ error: 'Error al actualizar el evento' }, { status: 500 })
  }
}
