import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId, friendId } = await req.json();

    if (!userId || !friendId) {
      return NextResponse.json({ message: "Datos incompletos." }, { status: 400 });
    }

    // Verificar si ambos usuarios existen
    const sender = await prisma.user.findUnique({ where: { id: userId } });
    const receiver = await prisma.user.findUnique({ where: { id: friendId } });

    if (!sender || !receiver) {
      return NextResponse.json({ message: "Uno de los usuarios no existe." }, { status: 404 });
    }

    // Verifica si la solicitud ya existe
    const existingRequest = await prisma.friend.findFirst({
      where: { userId, friendId, status: 'pending' },
    });

    if (existingRequest) {
      return NextResponse.json({ message: "La solicitud ya fue enviada." }, { status: 400 });
    }

    // Crea una solicitud de amistad
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
