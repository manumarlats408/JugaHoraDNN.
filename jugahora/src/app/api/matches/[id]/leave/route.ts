// app/api/matches/[id]/leave/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('Iniciando POST request para retirarse de un partido');
  try {
    const matchId = parseInt(params.id);
    console.log('ID del partido:', matchId);

    // Extrae el token de las cookies y verifica la autenticación
    const token = cookies().get('token')?.value;
    const userId = await verifyAuth(token);

    if (!userId) {
      console.log('Usuario no autenticado');
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Transacción para retirar al usuario del partido
    const result = await prisma.$transaction(async (prisma) => {
      console.log('Buscando partido...');
      const match = await prisma.partidos_club.findUnique({
        where: { id: matchId },
      });

      if (!match) {
        console.log('Partido no encontrado');
        throw new Error('Partido no encontrado');
      }

      if (!match.usuarios.includes(userId)) {
        console.log('Usuario no está unido al partido');
        throw new Error('No estás unido a este partido');
      }

      console.log('Actualizando el partido para remover el usuario');

      // Actualiza el partido para remover el userId del array `usuarios` y decrementa la cantidad de jugadores
      const updatedMatch = await prisma.partidos_club.update({
        where: { id: matchId },
        data: {
          players: match.players - 1,
          usuarios: {
            set: match.usuarios.filter((id) => id !== userId), // Remueve el userId
          },
        },
      });

      // Actualiza el usuario para remover el `matchId` de su array `partidosUnidos`
      await prisma.user.update({
        where: { id: userId },
        data: {
          partidosUnidos: {
            set: (await prisma.user.findUnique({
              where: { id: userId },
              select: { partidosUnidos: true },
            }))?.partidosUnidos.filter((id) => id !== matchId) || [], // Remueve el matchId
          },
        },
      });

      console.log('Partido actualizado:', updatedMatch);
      return updatedMatch;
    });

    console.log('Transacción completada exitosamente');
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error al retirarse del partido:', error);
    return NextResponse.json({ error: 'Error al retirarse del partido' }, { status: 400 });
  }
}
