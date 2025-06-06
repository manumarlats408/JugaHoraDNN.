import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const result = await prisma.user.update({
      where: { id: 9 }, // Usá un ID válido tuyo
      data: {
        partidosAgregar: {
          increment: 1,
        },
      },
    })

    return NextResponse.json({ message: 'Incrementado', result })
  } catch (error) {
    console.error('❌ Error al incrementar:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : error }, { status: 500 })
  }
}
