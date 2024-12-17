import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId'); // ID del usuario receptor

    if (!userId) {
      return NextResponse.json({ message: "ID del usuario requerido." }, { status: 400 });
    }

    // Usar la relación 'receiver' en lugar de 'receiverId'
    const requests = await prisma.friend.findMany({
      where: { 
        receiver: { id: parseInt(userId) },
        status: "pending"
      },
      include: {
        sender: true, // Incluye detalles del usuario que envió la solicitud
      },
    });

    return NextResponse.json(requests, { status: 200 });
  } catch (error) {
    console.error("Error al obtener solicitudes:", error);
    return NextResponse.json({ message: "Error interno del servidor." }, { status: 500 });
  }
}
