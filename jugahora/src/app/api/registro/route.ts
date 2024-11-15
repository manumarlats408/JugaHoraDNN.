import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';

export async function POST(request: Request) {
  const { isClub, email, password, firstName, lastName, phoneNumber, address, age, nivel } = await request.json();

  // Verificar si el usuario o club ya existe
  const existingEntity = await prisma.user.findUnique({ where: { email } }) ||
                         await prisma.club.findUnique({ where: { email } });

  if (existingEntity) {
    return NextResponse.json({ error: 'El correo ya está registrado' }, { status: 400 });
  }

  // Hashear la contraseña
  const hashedPassword = await hash(password, 10);

  try {
    let newEntity;

    if (isClub) {
      // Crear un nuevo club
      newEntity = await prisma.club.create({
        data: {
          email,
          password: hashedPassword,
          name: firstName, // Usamos firstName como nombre del club
          phoneNumber,
          address,
        },
      });
    } else {
      // Crear un nuevo usuario
      newEntity = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phoneNumber: phoneNumber || null,
          address: address || null,
          age: age ? parseInt(age as string) : null,
          nivel: nivel || null, // Agregar campo nivel, puede ser nulo inicialmente
        },
      });
    }

    return NextResponse.json(newEntity, { status: 201 });
  } catch (error) {
    console.error('Error al registrar:', error);
    return NextResponse.json({ error: 'Ocurrió un error al registrar' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { email, nivel } = await request.json();

  if (!nivel) {
    return NextResponse.json({ error: 'El nivel es obligatorio' }, { status: 400 });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { nivel },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar el nivel:', error);
    return NextResponse.json({ error: 'Ocurrió un error al actualizar el nivel' }, { status: 500 });
  }
}
