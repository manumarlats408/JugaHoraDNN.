import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { date, time, court } = await request.json();

    console.log("Datos recibidos:", { date, time, court });

    if (!date || !time || !court) {
      console.log("Faltan campos requeridos");
      return NextResponse.json(
        { error: 'Por favor, proporciona todos los campos requeridos: date, time, court.' },
        { status: 400 }
      );
    }

    // Intentar conectar y realizar la creación
    console.log("Intentando conectar a Prisma...");
    await prisma.$connect();
    console.log("Conexión establecida");

    console.log("Creando partido...");
    const newMatch = await prisma.partidos_club.create({
      data: {
        date: new Date(date),
        time,
        court,
        players: 0,
        maxPlayers: 4,
      },
    });

    console.log("Partido creado:", newMatch);
    await prisma.$disconnect();
    console.log("Desconectado de Prisma");

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
