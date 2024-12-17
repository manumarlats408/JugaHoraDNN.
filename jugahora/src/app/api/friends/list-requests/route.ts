import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { JsonWebTokenError } from 'jsonwebtoken';

export async function GET(req: Request) {
  try {
    // Extraer el token de las cookies
    const cookieHeader = req.headers.get('Cookie');
    const token = cookieHeader
      ?.split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1];

    console.log("Token recibido:", token); // Depuración

    if (!token) {
      return NextResponse.json({ message: "No autorizado: Token no encontrado." }, { status: 401 });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
    console.log("Token decodificado:", decoded);

    const userId = decoded.id; // ID del usuario autenticado

    // Buscar solicitudes de amistad donde el usuario es el receptor
    const requests = await prisma.friend.findMany({
      where: {
        receiver: { id: userId }, // El usuario autenticado es el receptor
        status: "pending",
      },
      include: {
        sender: true, // Incluir detalles del remitente
      },
    });

    return NextResponse.json(requests, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof JsonWebTokenError) {
      console.error("JWT Error:", error.message);
      return NextResponse.json({ message: "Token inválido." }, { status: 401 });
    } else if (error instanceof Error) {
      console.error("Error general:", error.message);
    }
    return NextResponse.json({ message: "Error interno del servidor." }, { status: 500 });
  }
}
