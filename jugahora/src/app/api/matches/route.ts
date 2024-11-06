// app/api/matches/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { date, time, court, clubId } = await request.json();

    const newMatch = await prisma.partidos_club.create({
      data: {
        date: new Date(date),
        time,
        court,
        players: 0,
        maxPlayers: 4,
        clubId: parseInt(clubId), // Now this should work correctly
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

  if (!clubId) {
    return NextResponse.json({ error: 'Club ID is required' }, { status: 400 });
  }

  try {
    const matches = await prisma.partidos_club.findMany({
      where: {
        clubId: parseInt(clubId),
      },
      orderBy: {
        date: 'asc',
      },
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json({ error: 'Error fetching matches' }, { status: 500 });
  }
}