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

    // Get the token from cookies
    const token = cookies().get('token')?.value;
    const userId = await verifyAuth(token);

    if (userId === null) {
      console.log('Usuario no autenticado');
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Use a transaction to ensure atomic operations
    const result = await prisma.$transaction(async (prisma) => {
      // Fetch the current match details
      console.log('Buscando partido...');
      const match = await prisma.partidos_club.findUnique({
        where: { id: matchId },
      });

      if (!match) {
        console.log('Partido no encontrado');
        throw new Error('Partido no encontrado');
      }

      if (match.players >= match.maxPlayers) {
        console.log('El partido está completo');
        throw new Error('El partido está completo');
      }

      // Check if the user is already in the "Usuarios" array
      if (match.usuarios && match.usuarios.includes(userId)) {
        console.log('Usuario ya está unido al partido');
        throw new Error('Ya estás unido a este partido');
      }

      // Update the "Usuarios" array in Partidos_club and increment the player count
      const updatedMatch = await prisma.partidos_club.update({
        where: { id: matchId },
        data: {
          players: match.players + 1,
          usuarios: {
            push: userId, // Add the userId to the Usuarios array
          },
        },
      });

      // Update the "PartidosUnidos" array in User to include this match
      await prisma.user.update({
        where: { id: userId },
        data: {
          partidosUnidos: {
            push: matchId, // Add the matchId to the PartidosUnidos array
          },
        },
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
