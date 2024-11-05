import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Crear un nuevo partido
export async function POST(request: Request) {
  try {
    const { date, time, court } = await request.json();

    // Verificación de datos
    if (!date || !time || !court) {
      return NextResponse.json(
        { error: 'Por favor, proporciona todos los campos requeridos: date, time, court.' },
        { status: 400 }
      );
    }

    // Validar formato de fecha y hora
    const formattedDate = new Date(date);
    if (isNaN(formattedDate.getTime())) {
      return NextResponse.json(
        { error: 'Formato de fecha no válido. Asegúrate de que el campo "date" sea una fecha válida.' },
        { status: 400 }
      );
    }

    // Intento de creación de partido
    const newMatch = await prisma.partidos_club.create({
      data: {
        date: formattedDate,
        time,
        court,
        players: 0,
        maxPlayers: 4,
      },
    });

    return NextResponse.json(newMatch);
  } catch (error: unknown) {
    // Verificación para asegurarnos de que error es un objeto con una propiedad message
    if (error instanceof Error) {
      console.error('Error al crear el partido:', error.message);
      return NextResponse.json(
        { error: `Error al crear el partido: ${error.message}` },
        { status: 500 }
      );
    }
    // Caso de error genérico
    console.error('Error al crear el partido:', error);
    return NextResponse.json(
      { error: 'Error al crear el partido. Revisa la configuración y los datos ingresados.' },
      { status: 500 }
    );
  }
}

// Obtener todos los partidos con espacio disponible (para jugadores)
export async function GET() {
  try {
    const matches = await prisma.partidos_club.findMany({
      where: {
        players: { lt: 4 }, // Partidos con menos de 4 jugadores
      },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(matches);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error al obtener partidos:', error.message);
      return NextResponse.json({ error: `Error al obtener los partidos: ${error.message}` }, { status: 500 });
    }
    console.error('Error al obtener partidos:', error);
    return NextResponse.json({ error: 'Error al obtener los partidos disponibles.' }, { status: 500 });
  }
}
