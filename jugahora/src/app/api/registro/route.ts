import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { email, password, firstName, lastName } = await request.json();

  // Verificar si el usuario ya existe
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return NextResponse.json({ error: 'El correo ya está registrado' }, { status: 400 });
  }

  // Hashear la contraseña
  const hashedPassword = await hash(password, 10);

  try {
    // Crear un nuevo usuario
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error al registrar el usuario:', error); // Muestra el error en la consola
    return NextResponse.json({ error: 'Ocurrió un error al registrar al usuario' }, { status: 500 });
  }
}
