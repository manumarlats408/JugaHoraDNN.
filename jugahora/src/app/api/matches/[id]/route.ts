import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { date, time, court, clubId } = await request.json();

    console.log("Datos recibidos:", { date, time, court, clubId });

    if (!date || !time || !court || !clubId) {
      console.log("Faltan campos requeridos");
      return NextResponse.json(
        { error: 'Por favor, proporciona todos los campos requeridos: date, time, court, clubId.' },
        { status: 400 }
      );
    }

    await prisma.$connect();
    console.log("Conexión establecida");

    const newMatch = await prisma.partidos_club.create({
      data: {
        date: new Date(date),
        time,
        court,
        players: 0,
        maxPlayers: 4,
        clubId: parseInt(clubId), // Asignar el clubId al partido
      },
    });

    console.log("Partido creado:", newMatch);
    await prisma.$disconnect();

    return NextResponse.json(newMatch);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error al crear el partido:', error.message);
      return NextResponse.json(
        { error: `Error al crear el partido: ${error.message}` },
        { status: 500 }
      );
    }

    console.error('Error desconocido al crear el partido:', error);
    return NextResponse.json(
      { error: 'Error al crear el partido. Revisa la configuración y los datos ingresados.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clubId = parseInt(searchParams.get('clubId') || '', 10);

  if (!clubId) {
    return NextResponse.json({ error: 'clubId es requerido' }, { status: 400 });
  }

  try {
    const matches = await prisma.partidos_club.findMany({
      where: {
        clubId: clubId,
        players: { lt: 4 }, // Partidos con espacio disponible
      },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(matches);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error al obtener partidos:', error.message);
      return NextResponse.json(
        { error: `Error al obtener los partidos: ${error.message}` },
        { status: 500 }
      );
    }
    console.error('Error al obtener partidos:', error);
    return NextResponse.json(
      { error: 'Error al obtener los partidos disponibles.' },
      { status: 500 }
    );
  }
}

