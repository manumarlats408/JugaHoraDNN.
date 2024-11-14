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

    // Extract token from cookies and verify authentication
    const token = cookies().get('token')?.value;
    const userId = await verifyAuth(token);

    if (!userId) {
      console.log('Usuario no autenticado');
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Start a transaction to join the user to the match
    const result = await prisma.$transaction(async (prisma) => {
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

      if (match.usuarios && match.usuarios.includes(userId)) {
        console.log('Usuario ya está unido al partido');
        throw new Error('Ya estás unido a este partido');
      }

      console.log('Actualizando el partido para agregar el usuario');
      
      // Update the match to add the userId to Usuarios array and increment the player count
      const updatedMatch = await prisma.partidos_club.update({
        where: { id: matchId },
        data: {
          players: match.players + 1,
          usuarios: {
            push: userId, // Ensure userId is defined before attempting this operation
          },
        },
      });

      // Update the user to add the matchId to PartidosUnidos array
      await prisma.user.update({
        where: { id: userId },
        data: {
          partidosUnidos: {
            push: matchId,
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
