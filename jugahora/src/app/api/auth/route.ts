export const runtime = 'nodejs'; // Cambia el runtime a Node.js

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';
export async function POST(request: Request) {
  try {
    console.log('Iniciando proceso de autenticación');
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
      },
    });

    console.log('Usuario encontrado:', usuario ? 'Sí' : 'No');

    if (!usuario) {
      console.log('Usuario no encontrado');
      return NextResponse.json(
        { error: 'Correo electrónico o contraseña inválidos' },
        { status: 401 }
      );
    }

    const esContraseñaValida = await bcrypt.compare(password, usuario.password);
    console.log('Contraseña válida:', esContraseñaValida);

    if (!esContraseñaValida) {
      console.log('Contraseña inválida');
      return NextResponse.json(
        { error: 'Correo electrónico o contraseña inválidos' },
        { status: 401 }
      );
    }

    console.log('Autenticación exitosa, generando token');
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

    console.log('Token generado, creando respuesta');
    const response = NextResponse.redirect(new URL('/menu', request.url));

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600,
      sameSite: 'strict',
    });

    console.log('Respuesta creada, redirigiendo');
    return response;
  } catch (error) {
    console.error('Error de inicio de sesión:', error);
    return NextResponse.json({ error: 'Ocurrió un error inesperado' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: Request) {
  const token = request.headers.get('Cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

  if (!token) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return NextResponse.json({ user: decoded });
  } catch (error) {
    console.error('Error al verificar el token:', error);
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }
}