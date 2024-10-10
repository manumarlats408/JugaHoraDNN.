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

    // Find the user
    console.log('Buscando usuario en la base de datos');
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
    }).catch(error => {
      console.error('Error al buscar usuario en la base de datos:', error);
      throw new Error('Error de base de datos al buscar usuario');
    });

    if (!user) {
      console.log('Usuario no encontrado');
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 });
    }

    console.log('Usuario encontrado, verificando contraseña');
    // Verify password
    const passwordValid = await compare(password, user.password).catch(error => {
      console.error('Error al comparar contraseñas:', error);
      throw new Error('Error al verificar la contraseña');
    });

    if (!passwordValid) {
      console.log('Contraseña incorrecta');
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    console.log('Contraseña válida, generando JWT');
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('JWT generado, creando respuesta');
    // Create the response
    const response = NextResponse.json({ message: 'Login exitoso' }, { status: 200 });

    console.log('Configurando cookie con el token');
    // Set the token as an HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
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
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (typeof decoded !== 'object' || !decoded) {
      console.log('Token inválido');
      throw new Error('Token inválido');
    }

    console.log('Token válido, buscando usuario en la base de datos');
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
    }).catch(error => {
      console.error('Error al buscar usuario en la base de datos:', error);
      throw new Error('Error de base de datos al buscar usuario');
    });

    if (!user) {
      console.log('Usuario no encontrado en la base de datos');
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    console.log('Usuario encontrado, enviando respuesta');
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error detallado en la verificación del token:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    return NextResponse.json({ error: `Error interno del servidor: ${error instanceof Error ? error.message : 'Error desconocido'}` }, { status: 500 });
  }
}