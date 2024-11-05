import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Crear un nuevo partido
export async function POST(request: Request) {
  const { date, time, court } = await request.json();

  const newMatch = await prisma.Partidos_club.create({
    data: {
      date: new Date(date),
      time,
      court,
      players: 0,
      maxPlayers: 4,
    },
  });

  return NextResponse.json(newMatch);
}

// Obtener todos los partidos con espacio disponible (para jugadores)
export async function GET() {
  const matches = await prisma.Partidos_club.findMany({
    where: {
      players: { lt: 4 }, // Partidos con menos de 4 jugadores
    },
    orderBy: { date: 'asc' },
  });

  return NextResponse.json(matches);
}
