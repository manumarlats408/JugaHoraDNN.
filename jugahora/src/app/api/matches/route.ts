// app/api/matches/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Definir el tipo del objeto "match"
interface Match {
  id: number;
  date: Date;
  time: string;
  court: string;
  players: number;
  maxPlayers: number;
  clubId: number;
  Club: {
    name: string;
  };
}

export async function POST(request: Request) {
  try {
    const { date, time, court, clubId } = await request.json();

    // Validar que los datos requeridos estén presentes
    if (!date || !time || !court || !clubId) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const newMatch = await prisma.partidos_club.create({
      data: {
        date: new Date(date),
        time,
        court,
        players: 0,
        maxPlayers: 4,
        clubId: parseInt(clubId),
      },
    });

    return NextResponse.json(newMatch);
  } catch (error) {
    console.error('Error creating match:', error);
    return NextResponse.json({ error: 'Error creating match' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get('clubId');

  try {
    if (clubId) {
      // Si se proporciona el clubId, devolver solo los partidos asociados a ese club
      const matches = await prisma.partidos_club.findMany({
        where: {
          clubId: parseInt(clubId),
        },
        orderBy: {
          date: 'asc',
        },
      });
      return NextResponse.json(matches);
    } else {
      // Si no se proporciona clubId, devolver todos los partidos con el nombre del club incluido
      const matches = await prisma.partidos_club.findMany({
        include: {
          Club: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          date: 'asc',
        },
      });

      // Formatear los partidos para incluir `nombreClub` directamente
      const formattedMatches = matches.map((match: Match) => ({
        ...match,
        nombreClub: match.Club.name,
      }));

      return NextResponse.json(formattedMatches);
    }
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json({ error: 'Error fetching matches' }, { status: 500 });
  }
}
