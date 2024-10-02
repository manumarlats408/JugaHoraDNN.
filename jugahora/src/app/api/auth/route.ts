import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // Asegúrate de instalar jwt con `npm install jsonwebtoken`

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secret-key'; // Asegúrate de definir una clave secreta segura en tu archivo .env

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const usuario = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        password: true,
      },
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Correo electrónico o contraseña inválidos' }, { status: 401 });
    }

    const esContraseñaValida = await bcrypt.compare(password, usuario.password);

    if (!esContraseñaValida) {
      return NextResponse.json({ error: 'Correo electrónico o contraseña inválidos' }, { status: 401 });
    }

    // Generar el token JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        firstName: usuario.firstName,
        lastName: usuario.lastName,
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Enviar el token al cliente
    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    console.error('Error de inicio de sesión:', error);
    return NextResponse.json({ error: 'Ocurrió un error inesperado' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
