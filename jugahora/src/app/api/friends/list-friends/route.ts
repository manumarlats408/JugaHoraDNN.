import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ message: "ID del usuario requerido." }, { status: 400 });
    }

    // Obtener lista de amigos aceptados
    const friends = await prisma.friend.findMany({
      where: { userId: parseInt(userId), status: 'accepted' },
      include: { receiver: true },
    });

    return NextResponse.json(friends, { status: 200 });
  } catch (error) {
    console.error("Error al obtener lista de amigos:", error);
    return NextResponse.json({ message: "Error interno del servidor." }, { status: 500 });
  }
}
