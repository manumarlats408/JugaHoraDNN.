import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { JsonWebTokenError } from 'jsonwebtoken'

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get('Cookie')
    const token = cookieHeader
      ?.split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1]

    if (!token) {
      return NextResponse.json({ message: 'No autorizado: Token no encontrado.' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number }
    const userId = decoded.id

    // Buscar solicitudes pendientes enviadas por el usuario
    const solicitudesPendientes = await prisma.friend.findMany({
      where: {
        userId: userId,
        status: 'pending',
      },
      select: {
        id: true,
        friendId: true,
        userId: true,
        status: true,
      },
    })

    return NextResponse.json(solicitudesPendientes, { status: 200 })
  } catch (error: unknown) {
    if (error instanceof JsonWebTokenError) {
      return NextResponse.json({ message: 'Token inválido.' }, { status: 401 })
    }
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 })
  }
}
