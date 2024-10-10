import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';



export async function POST(request: Request) {
  const { email, password, firstName, lastName, phoneNumber, address, age } = await request.json();

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
    // Crear un nuevo usuario con los campos opcionales
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber: phoneNumber || null,  // Si no se proporciona, asignar null
        address: address || null,          // Si no se proporciona, asignar null
        age: age || null,                  // Si no se proporciona, asignar null
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    return NextResponse.json({ error: 'Ocurrió un error al registrar al usuario' }, { status: 500 });
  }
}
