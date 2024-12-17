import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { JsonWebTokenError } from 'jsonwebtoken';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: "No autorizado." }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };

    const userId = decoded.id;

    const requests = await prisma.friend.findMany({
      where: {
        receiver: { id: userId },
        status: "pending",
      },
      include: {
        sender: true,
      },
    });

    return NextResponse.json(requests, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof JsonWebTokenError) {
      console.error("JWT Error:", error.message);
      return NextResponse.json({ message: "Token inválido." }, { status: 401 });
    }
    return NextResponse.json({ message: "Error interno del servidor." }, { status: 500 });
  }
}
