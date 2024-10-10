import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma';



export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, fecha, jugadores, resultado } = body

    const newPartido = await prisma.partidos.create({
      data: {
        userId: parseInt(userId),
        fecha: new Date(fecha),
        jugadores,
        resultado,
      },
    })

    return NextResponse.json(newPartido, { status: 201 })
  } catch (error) {
    console.error('Error al crear nuevo partido:', error)
    return NextResponse.json({ error: 'Error al crear nuevo partido' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'UserId es requerido' }, { status: 400 })
    }

    const partidos = await prisma.partidos.findMany({
      where: {
        userId: parseInt(userId),
      },
      orderBy: {
        fecha: 'desc',
      },
    })

    return NextResponse.json(partidos)
  } catch (error) {
    console.error('Error al obtener partidos:', error)
    return NextResponse.json({ error: 'Error al obtener partidos' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}