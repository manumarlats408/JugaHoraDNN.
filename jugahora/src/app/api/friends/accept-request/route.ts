import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { requestId } = await req.json();

    if (!requestId) {
      return NextResponse.json({ message: "ID de la solicitud requerido." }, { status: 400 });
    }

    // Buscar la solicitud pendiente
    const request = await prisma.friend.findUnique({
      where: { id: requestId },
      include: { sender: true, receiver: true }, // Incluye detalles del sender y receiver
    });

    if (!request) {
      return NextResponse.json({ message: "Solicitud no encontrada." }, { status: 404 });
    }

    // Actualizar el estado a 'accepted'
    await prisma.friend.update({
      where: { id: requestId },
      data: { status: 'accepted' },
    });

    // Agregar a los amigos
    await prisma.friend.createMany({
      data: [
        { userId: request.sender.id, friendId: request.receiver.id, status: 'accepted' },
        { userId: request.receiver.id, friendId: request.sender.id, status: 'accepted' },
      ],
    });

    return NextResponse.json({ message: "Solicitud aceptada." }, { status: 200 });
  } catch (error) {
    console.error("Error al aceptar solicitud:", error);
    return NextResponse.json({ message: "Error interno del servidor." }, { status: 500 });
  }
}
