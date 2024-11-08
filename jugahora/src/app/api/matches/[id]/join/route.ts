// app/api/matches/[id]/join/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('Iniciando POST request para unirse a un partido');
  try {
    const matchId = parseInt(params.id);
    console.log('ID del partido:', matchId);

    // Extraemos el valor del token de las cookies
    const token = cookies().get('token')?.value;
    const userId = await verifyAuth(token); // Pasamos solo el token a verifyAuth

    if (userId === null) {
      console.log('Usuario no autenticado');
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Iniciar una transacción para unir al usuario al partido
    const result = await prisma.$transaction(async (prisma) => {
      console.log('Buscando partido...');
      const match = await prisma.partidos_club.findUnique({
        where: { id: matchId },
        include: { Usuarios: true },
      });
      console.log('Partido encontrado:', match);

      if (!match) {
        console.log('Partido no encontrado');
        throw new Error('Partido no encontrado');
      }

      if (match.players >= match.maxPlayers) {
        console.log('El partido está completo');
        throw new Error('El partido está completo');
      }

      if (match.Usuarios.some((user) => user.id === userId)) {
        console.log('Usuario ya está unido al partido');
        throw new Error('Ya estás unido a este partido');
      }

      console.log('Actualizando el partido para agregar el usuario');
      // Actualizar el partido para agregar el usuario
      const updatedMatch = await prisma.partidos_club.update({
        where: { id: matchId },
        data: {
          players: match.players + 1,
          Usuarios: {
            connect: { id: userId },
          },
        },
        include: { Usuarios: true },
      });
      console.log('Partido actualizado:', updatedMatch);

      return updatedMatch;
    });

    console.log('Transacción completada exitosamente');
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error al unirse al partido:', error);
    return NextResponse.json({ error: 'Error al unirse al partido' }, { status: 400 });
  }
}
