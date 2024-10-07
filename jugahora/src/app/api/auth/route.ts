import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Find the user
    const user = await prisma.user.findUnique({
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

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 });
    }

    // Verify password
    const passwordValid = await compare(password, user.password);

    if (!passwordValid) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Create the response
    const response = NextResponse.json({ message: 'Login exitoso' }, { status: 200 });

    // Set the token as an HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600, // 1 hour
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    return NextResponse.json({ error: 'Ocurrió un error durante el inicio de sesión' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (typeof decoded !== 'object' || !decoded) {
      throw new Error('Token inválido');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        address: true,
        age: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error en la verificación del token:', error);
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }
}