import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  console.log('Iniciando proceso de login (POST)');
  try {
    const { email, password } = await request.json();
    console.log(`Email recibido: ${email}`);

    // Find the user or club
    console.log('Buscando usuario o club en la base de datos');
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

    const club = await prisma.club.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        phoneNumber: true,
        address: true,
      },
    });

    if (!user && !club) {
      console.log('Usuario o club no encontrado');
      return NextResponse.json({ error: 'Usuario o club no encontrado' }, { status: 401 });
    }

    const entity = user || club;
    if (!entity) {
      console.log('Entidad no encontrada');
      return NextResponse.json({ error: 'Entidad no encontrada' }, { status: 401 });
    }

    console.log('Entidad encontrada, verificando contraseña');

    // Verify password
    const passwordValid = await compare(password, entity.password);

    if (!passwordValid) {
      console.log('Contraseña incorrecta');
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    console.log('Contraseña válida, generando JWT');
    // Generate JWT
    const token = jwt.sign(
      { id: entity.id, email: entity.email, isClub: !!club },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('JWT generado, creando respuesta');
    // Create the response
    const response = NextResponse.json({ 
      message: 'Login exitoso',
      isClub: !!club
    }, { status: 200 });

    console.log('Configurando cookie con el token');
    // Set the token as an HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600, // 1 hour
      path: '/',
    });

    console.log('Proceso de login completado exitosamente');
    return response;
  } catch (error) {
    console.error('Error detallado en el inicio de sesión:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    return NextResponse.json({ error: `Error interno del servidor: ${error instanceof Error ? error.message : 'Error desconocido'}` }, { status: 500 });
  }
}

export async function GET(request: Request) {
  console.log('Iniciando verificación de token (GET)');
  try {
    const token = request.headers.get('Cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

    if (!token) {
      console.log('No se encontró token en la cookie');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    console.log('Token encontrado, verificando...');
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number, email: string, isClub: boolean };
    
    if (typeof decoded !== 'object' || !decoded) {
      console.log('Token inválido');
      throw new Error('Token inválido');
    }

    console.log('Token válido, buscando usuario o club en la base de datos');
    let entity;
    if (decoded.isClub) {
      entity = await prisma.club.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          name: true,
          phoneNumber: true,
          address: true,
        },
      });
    } else {
      entity = await prisma.user.findUnique({
        where: { id: decoded.id },
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
    }

    if (!entity) {
      console.log('Usuario o club no encontrado en la base de datos');
      return NextResponse.json({ error: 'Usuario o club no encontrado' }, { status: 404 });
    }

    console.log('Entidad encontrada, enviando respuesta');
    return NextResponse.json({ entity, isClub: decoded.isClub });
  } catch (error) {
    console.error('Error detallado en la verificación del token:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    return NextResponse.json({ error: `Error interno del servidor: ${error instanceof Error ? error.message : 'Error desconocido'}` }, { status: 500 });
  }
}