import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const usuario = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        password: true,
      },
    })

    if (!usuario) {
      return NextResponse.json({ error: 'Correo electrónico o contraseña inválidos' }, { status: 401 })
    }

    const esContraseñaValida = await bcrypt.compare(password, usuario.password)

    if (!esContraseñaValida) {
      return NextResponse.json({ error: 'Correo electrónico o contraseña inválidos' }, { status: 401 })
    }

    // Contraseña válida, inicio de sesión exitoso
    return NextResponse.json({ mensaje: 'Inicio de sesión exitoso' }, { status: 200 })
  } catch (error) {
    console.error('Error de inicio de sesión:', error)
    return NextResponse.json({ error: 'Ocurrió un error inesperado' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}