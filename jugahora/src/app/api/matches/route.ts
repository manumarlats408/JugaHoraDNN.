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
    const { date, startTime, endTime, court, price, clubId, userId, players } = await request.json();

    if (!date || !startTime || !endTime || !court || !clubId || !userId) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (!Array.isArray(players)) {
      return NextResponse.json({ error: 'El campo players debe ser un array' }, { status: 400 });
    }

    const matchPrice = price !== undefined ? price : 0;

    const newMatch = await prisma.partidos_club.create({
      data: {
        date: new Date(date),
        startTime,
        endTime,
        court,
        players: players.length + 1,
        maxPlayers: 4,
        clubId: parseInt(clubId),
        price: matchPrice,
        userId,
        usuarios: [userId, ...players],
        categoria: "Nivel " + userId,
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
