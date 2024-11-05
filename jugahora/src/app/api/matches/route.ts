import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { date, time, court } = await request.json();

    // Verificar que todos los campos necesarios estén presentes
    if (!date || !time || !court) {
      return NextResponse.json(
        { error: 'Todos los campos (date, time, court) son obligatorios.' },
        { status: 400 }
      );
    }

    // Crear el partido en la base de datos
    const newMatch = await prisma.partidos_club.create({
      data: {
        date: new Date(date),
        time,
        court,
        players: 0,  // Asignar valores iniciales
        maxPlayers: 4,
      },
    });

    return NextResponse.json(newMatch, { status: 201 });
  } catch (error) {
    console.error('Error al crear el partido:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error al crear el partido en la base de datos.' },
      { status: 500 }
    );
  }
}

// Obtener todos los partidos con espacios disponibles
export async function GET() {
  try {
    const matches = await prisma.partidos_club.findMany({
      where: { players: { lt: 4 } },
      orderBy: { date: 'asc' },
    });
    return NextResponse.json(matches);
  } catch (error) {
    console.error('Error al obtener partidos:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error al obtener los partidos.' },
      { status: 500 }
    );
  }
}
