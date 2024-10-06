import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

export async function POST(request: Request) {
  console.log('Iniciando proceso de login');
  const prisma = new PrismaClient();

  try {
    const { email, password } = await request.json();
    console.log('Email recibido:', email);

    const usuario = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        password: true,
        phoneNumber: true,
        address: true,
        age: true,
      },
    });

    console.log('Usuario encontrado:', usuario ? 'Sí' : 'No');

    if (!usuario) {
      return NextResponse.json({ error: 'Correo electrónico o contraseña inválidos' }, { status: 401 });
    }

    const esContraseñaValida = await bcrypt.compare(password, usuario.password);

    if (!esContraseñaValida) {
      return NextResponse.json({ error: 'Correo electrónico o contraseña inválidos' }, { status: 401 });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        firstName: usuario.firstName,
        lastName: usuario.lastName,
        phoneNumber: usuario.phoneNumber,
        address: usuario.address,
        age: usuario.age,
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const response = NextResponse.json({ message: 'Login exitoso' });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600,
      sameSite: 'lax',
      path: '/',
    });

    console.log('Login exitoso, token generado');
    return response;
  } catch (error) {
    console.error('Error detallado de inicio de sesión:', error);
    return NextResponse.json({ error: 'Ocurrió un error inesperado'}, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: Request) {
  const prisma = new PrismaClient();  // Inicia Prisma aquí

  const token = request.headers.get('Cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

  if (!token) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    // Explicitly typing decoded as JwtPayload
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & { id: string };

    if (!decoded || !decoded.id) {
      throw new Error('Token inválido');
    }

    return NextResponse.json({ user: decoded });
  } catch (error) {
    console.error('Error al verificar el token:', error);
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  } finally {
    await prisma.$disconnect();  // Desconectar Prisma
  }
}
