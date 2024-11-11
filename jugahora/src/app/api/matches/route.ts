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
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Ensure that price is defined and defaults to 0 if not provided
    const matchPrice = price !== undefined ? price : 0;

  
    const newMatch = await prisma.partidos_club.create({
      data: {
        date: new Date(date),
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
    return NextResponse.json({ error: 'Error creating match' }, { status: 500 });
  }
}

// ... (rest of the code remains the same)

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
        date: match.date.toISOString().split('T')[0], // Ensures date is sent as 'YYYY-MM-DD'
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
