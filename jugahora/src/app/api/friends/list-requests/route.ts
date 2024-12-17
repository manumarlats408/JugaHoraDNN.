import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ message: "ID del usuario requerido." }, { status: 400 });
    }

    // Listar solicitudes recibidas pendientes
    const requests = await prisma.friend.findMany({
      where: { friendId: parseInt(userId), status: 'pending' },
      include: { sender: true },
    });

    return NextResponse.json(requests, { status: 200 });
  } catch (error) {
    console.error("Error al obtener solicitudes:", error);
    return NextResponse.json({ message: "Error interno del servidor." }, { status: 500 });
  }
}
