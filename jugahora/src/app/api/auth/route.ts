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
      select: { id: true, email: true, password: true }
    });
    const club = await prisma.club.findUnique({ 
      where: { email },
      select: { id: true, email: true, password: true }
    });

    const entity = user || club;

    if (!entity) {
      console.log('Entidad no encontrada');
      return NextResponse.json({ error: 'Usuario o club no encontrado' }, { status: 401 });
    }

    console.log('Entidad encontrada, verificando contraseña');
    // Verify password
    if ('password' in entity) {
      const passwordValid = await compare(password, entity.password);

      if (!passwordValid) {
        console.log('Contraseña incorrecta');
        return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
      }

      console.log('Contraseña válida, generando JWT');
      // Generate JWT
      const token = jwt.sign(
        { id: entity.id.toString(), email: entity.email, isClub: !!club },
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
    } else {
      console.log('Error: La entidad no tiene una propiedad password');
      return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
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
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string, email: string, isClub: boolean };
    
    console.log('Token válido, buscando entidad en la base de datos');
    const entity = decoded.isClub
      ? await prisma.club.findUnique({ where: { id: parseInt(decoded.id, 10) } })
      : await prisma.user.findUnique({ where: { id: parseInt(decoded.id, 10) } });

    if (!entity) {
      console.log('Entidad no encontrada en la base de datos');
      return NextResponse.json({ error: 'Entidad no encontrada' }, { status: 404 });
    }

    console.log('Entidad encontrada, enviando respuesta');
    return NextResponse.json({ entity, isClub: decoded.isClub });
  } catch (error) {
    console.error('Error detallado en la verificación del token:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    return NextResponse.json({ error: `Error interno del servidor: ${error instanceof Error ? error.message : 'Error desconocido'}` }, { status: 500 });
  }
}