import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';
const prisma = new PrismaClient();

export async function POST(request: Request) {
  console.log('Iniciando proceso de login');

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
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Método GET no permitido' }, { status: 405 });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}