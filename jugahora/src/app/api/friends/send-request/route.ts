import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    // Extraer el token de autorización del encabezado
    const authHeader = req.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: "No autorizado." }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };

    const userId = decoded.userId; // El ID del usuario autenticado
    const { friendId } = await req.json();

    if (!userId || !friendId) {
      return NextResponse.json({ message: "Datos incompletos." }, { status: 400 });
    }

    // Verificar si ya existe una solicitud pendiente
    const existingRequest = await prisma.friend.findFirst({
      where: {
        sender: { id: userId },    // Accede a la relación 'sender'
        receiver: { id: friendId }, // Accede a la relación 'receiver'
        status: "pending",
      },
    });

    if (existingRequest) {
      return NextResponse.json({ message: "La solicitud ya fue enviada." }, { status: 400 });
    }

    // Crear la solicitud de amistad
    await prisma.friend.create({
      data: {
        sender: { connect: { id: userId } },
        receiver: { connect: { id: friendId } },
        status: "pending",
      },
    });

    return NextResponse.json({ message: "Solicitud enviada con éxito." }, { status: 200 });
  } catch (error) {
    console.error("Error al enviar solicitud:", error);
    return NextResponse.json({ message: "Error interno del servidor." }, { status: 500 });
  }
}
