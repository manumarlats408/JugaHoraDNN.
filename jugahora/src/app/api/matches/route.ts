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
  Club: {
    name: string;
    address: string | null;
  };
}

// ... (previous imports)

// POST: Create a new match
export async function POST(request: Request) {
  try {
    const { date, startTime, endTime, court, clubId, price } = await request.json();

    // Validate required fields
    if (!date || !startTime || !endTime || !court || !clubId) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    // Ensure that price is defined and defaults to 0 if not provided
    const matchPrice = price !== undefined ? parseFloat(price) : 0;

    // Parse the ISO date string
    const matchDateTime = new Date(date);

    // Check if the date is valid
    if (isNaN(matchDateTime.getTime())) {
      return NextResponse.json({ error: 'Fecha u hora inválida' }, { status: 400 });
    }

    const newMatch = await prisma.partidos_club.create({
      data: {
        date: matchDateTime,
        startTime,
        endTime,
        court,
        players: 0,
        maxPlayers: 4,
        clubId: parseInt(clubId),
        price: matchPrice,
      },
    });

    return NextResponse.json(newMatch);
  } catch (error) {
    console.error('Error creating match:', error);
    return NextResponse.json({ error: 'Error al crear el partido' }, { status: 500 });
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
