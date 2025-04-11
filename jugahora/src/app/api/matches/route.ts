// app/api/matches/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Define the interface to include the new fields
interface Match {
  id: number;
  date: Date;
  startTime: string;
  endTime: string;
  court: string;
  players: number;
  maxPlayers: number;
  price: number;
  clubId: number;
  userId: number | null; // Nueva columna userId
  Club: {
    name: string;
    address: string | null;
  };
}

// POST: Create a new match
// app/api/matches/route.ts

export async function POST(request: Request) {
  try {
    const { date, startTime, endTime, court, price, clubId, userId, users } = await request.json();

    if (!date || !startTime || !endTime || !court || !clubId || !userId) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const matchPrice = price !== undefined ? price : 0;

    // Crear el partido con el userId del creador y los usuarios seleccionados
    const newMatch = await prisma.partidos_club.create({
      data: {
        date: new Date(date),
        startTime,
        endTime,
        court,
        players: users.length + 1,  // 1 para el creador del partido + los jugadores seleccionados
        maxPlayers: 4,
        clubId: parseInt(clubId),
        price: matchPrice,
        userId,  // Agregar el userId del creador
        usuarios: [userId, ...users],  // Guardar los userIds en la columna usuarios
        categoria: "Nivel " + userId,  // Usar el nivel del creador
      },
    });

    return NextResponse.json(newMatch);
  } catch (error) {
    console.error('Error creating match:', error);
    return NextResponse.json({ error: 'Error creating match' }, { status: 500 });
  }
}


// GET: Retrieve matches
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get('clubId');

  try {
    if (clubId) {
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
      const matches = await prisma.partidos_club.findMany({
        include: {
          Club: {
            select: {
              name: true,
              address: true,
            },
          },
        },
        orderBy: {
          date: 'asc',
        },
      });

      const formattedMatches = matches.map((match: Match) => ({
        ...match,
        nombreClub: match.Club.name,
        direccionClub: match.Club.address,
      }));

      return NextResponse.json(formattedMatches);
    }
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json({ error: 'Error fetching matches' }, { status: 500 });
  }
}
