import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const match = await prisma.partidos_club.findUnique({
      where: { 
        id: parseInt(params.id) 
      },
      select: {
        usuarios: true,
      },
    })

    if (!match) {
      return NextResponse.json(
        { message: 'Match not found' },
        { status: 404 }
      )
    }

    // Fetch user details for each user ID
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: match.usuarios
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching joined users:', error)
    return NextResponse.json(
      { message: 'Error fetching joined users' },
      { status: 500 }
    )
  }
}