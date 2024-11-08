import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyAuth } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const matchId = parseInt(params.id)

    // Verificar la autenticación del usuario
    const userId = await verifyAuth(cookies())
    if (userId === null) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Iniciar una transacción
    const result = await prisma.$transaction(async (prisma) => {
      // Obtener el partido actual
      const match = await prisma.partidos_club.findUnique({
        where: { id: matchId },
        include: { Usuarios: true }
      })

      if (!match) {
        throw new Error('Partido no encontrado')
      }

      if (match.players >= match.maxPlayers) {
        throw new Error('El partido está completo')
      }

      if (match.Usuarios.some(user => user.id === userId)) {
        throw new Error('Ya estás unido a este partido')
      }

      // Actualizar el partido
      const updatedMatch = await prisma.partidos_club.update({
        where: { id: matchId },
        data: {
          players: match.players + 1,
          Usuarios: {
            connect: { id: userId }
          }
        },
        include: { Usuarios: true }
      })

      return updatedMatch
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error al unirse al partido:', error)
    return NextResponse.json({ error }, { status: 400 })
  }
}