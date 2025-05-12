import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get("clubId");

    if (!clubId) {
      return NextResponse.json({ error: "Falta el parámetro clubId" }, { status: 400 });
    }

    const cancelaciones = await prisma.jugadorCancelado.findMany({
      where: { clubId: parseInt(clubId) },
      orderBy: { cantidadCancelaciones: 'desc' },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    const resultado = cancelaciones.map((item) => ({
      id: item.userId,
      firstName: item.user.firstName,
      lastName: item.user.lastName,
      email: item.user.email,
      cantidadCancelaciones: item.cantidadCancelaciones,
      ultimaCancelacion: item.ultimaCancelacion
    }));

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Error en /api/jugadores-cancelados:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
