import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { JsonWebTokenError } from 'jsonwebtoken';


export async function POST(req: Request) {
  try {
    // Extraer el token del encabezado
    const authHeader = req.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: "No autorizado." }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    console.log("Token recibido:", token); // Depuración

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    console.log("Token decodificado:", decoded);

    const userId = decoded.userId; // ID del usuario autenticado
    const { friendId } = await req.json();

    if (!userId || !friendId) {
      return NextResponse.json({ message: "Datos incompletos." }, { status: 400 });
    }

    // Verificar si ya existe una solicitud pendiente
    const existingRequest = await prisma.friend.findFirst({
      where: {
        sender: { id: userId },
        receiver: { id: friendId },
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
  } catch (error: unknown) {
    if (error instanceof JsonWebTokenError) {
      console.error("JWT Error:", error.message);
    } else if (error instanceof Error) {
      console.error("Error general:", error.message);
    }
    return NextResponse.json({ message: "Error interno del servidor." }, { status: 500 });
  }
}
