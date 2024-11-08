import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyAuth } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('Iniciando POST request para unirse a un partido')
  try {
    const matchId = parseInt(params.id)
    console.log('ID del partido:', matchId)

    console.log('Obteniendo cookies:', cookies().getAll())
    const userId = await verifyAuth(cookies())
    console.log('Resultado de verifyAuth:', userId)

    if (userId === null) {
      console.log('Usuario no autenticado')
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    console.log('Usuario autenticado, ID:', userId)

    // Iniciar una transacción
    const result = await prisma.$transaction(async (prisma) => {
      console.log('Iniciando transacción Prisma')
      // Obtener el partido actual
      const match = await prisma.partidos_club.findUnique({
        where: { id: matchId },
        include: { Usuarios: true }
      })
      console.log('Partido encontrado:', match)

      if (!match) {
        console.log('Partido no encontrado')
        throw new Error('Partido no encontrado')
      }

      if (match.players >= match.maxPlayers) {
        console.log('El partido está completo')
        throw new Error('El partido está completo')
      }

      if (match.Usuarios.some(user => user.id === userId)) {
        console.log('Usuario ya unido al partido')
        throw new Error('Ya estás unido a este partido')
      }

      console.log('Actualizando partido')
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
      console.log('Partido actualizado:', updatedMatch)

      return updatedMatch
    })

    console.log('Transacción completada exitosamente')
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error al unirse al partido:', error)
    return NextResponse.json({ error }, { status: 400 })
  }
}