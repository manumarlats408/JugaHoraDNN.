import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      nombre,
      date,
      startTime,
      endTime,
      clubId,
      categoria,
      genero,
      tipo,
      maxParejas,
      formato,
    } = data;

    const nuevoEvento = await prisma.evento_club.create({
      data: {
        nombre,
        date: new Date(date),
        startTime,
        endTime,
        clubId,
        categoria,
        genero,
        tipo,
        maxParejas: parseInt(maxParejas),
        formato: tipo === 'torneo' ? formato : null,
      },
    });

    return NextResponse.json(nuevoEvento, { status: 201 });
  } catch (error) {
    console.error('Error al crear evento:', error);
    return NextResponse.json({ error: 'Error al crear el evento' }, { status: 500 });
  }
}
