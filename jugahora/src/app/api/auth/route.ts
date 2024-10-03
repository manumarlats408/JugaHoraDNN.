import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken'; // Import JwtPayload

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

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
        phoneNumber: true, // Select these if needed
        address: true,
        age: true
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Correo electrónico o contraseña inválidos' },
        { status: 401 }
      );
    }

    const esContraseñaValida = await bcrypt.compare(password, usuario.password);

    if (!esContraseñaValida) {
      return NextResponse.json(
        { error: 'Correo electrónico o contraseña inválidos' },
        { status: 401 }
      );
    }

    // Generar el token JWT
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

    // Enviar el token en la cookie
    const response = NextResponse.redirect(new URL('/menu', request.url));
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600,
      sameSite: 'strict',
    });

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
    // Explicitly typing decoded as JwtPayload
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & { id: string };

    if (!decoded || !decoded.id) {
      throw new Error('Token inválido');
    }

    return NextResponse.json({ user: decoded });
  } catch (error) {
    console.error('Error al verificar el token:', error);
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }
}
