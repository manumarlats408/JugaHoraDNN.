import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const userId = 9 // podés cambiarlo a cualquier userId que quieras testear

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        partidosAgregar: {
          increment: 1,
        },
      },
    })

    return NextResponse.json({ message: `partidosAgregar actualizado`, updated })
  } catch (error) {
    console.error('❌ Error en test-user-update:', error)
    return NextResponse.json({ error: 'Error al actualizar partidosAgregar' }, { status: 500 })
  }
}
