// app/api/matches/[id]/join/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const matchId = parseInt(params.id);

  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Se requiere el ID del usuario' }, { status: 400 });
    }

    const match = await prisma.partidos_club.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return NextResponse.json({ error: 'Partido no encontrado' }, { status: 404 });
    }

    if (match.players >= match.maxPlayers) {
      return NextResponse.json({ error: 'El partido está completo' }, { status: 400 });
    }

    const updatedMatch = await prisma.partidos_club.update({
      where: { id: matchId },
      data: {
        players: match.players + 1,
        Usuarios: {
          connect: { id: userId },
        },
      },
    });

    return NextResponse.json(updatedMatch);
  } catch (error) {
    console.error('Error al unirse al partido:', error);
    return NextResponse.json({ error: 'Error al unirse al partido' }, { status: 500 });
  }
}