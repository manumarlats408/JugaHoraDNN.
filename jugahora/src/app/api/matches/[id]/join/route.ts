import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const matchId = parseInt(params.id);

  try {
    // Obtener el userId desde el cuerpo de la solicitud
    const { userId } = await request.json();
    console.log('UserId recibido:', userId);

    if (!userId) {
      return NextResponse.json({ error: 'Se requiere el ID del usuario' }, { status: 400 });
    }

    // Obtener el partido
    const match = await prisma.partidos_club.findUnique({
      where: { id: matchId },
    });
    console.log('Partido encontrado:', match);

    if (!match) {
      return NextResponse.json({ error: 'Partido no encontrado' }, { status: 404 });
    }

    if (match.players >= match.maxPlayers) {
      return NextResponse.json({ error: 'El partido está completo' }, { status: 400 });
    }


    const userExists = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    const matchExists = await prisma.partidos_club.findUnique({
      where: { id: matchId }
    });
    
    if (!userExists || !matchExists) {
      throw new Error('El usuario o el partido no existen');
    }
    
    const updatedMatch = await prisma.partidos_club.update({
      where: { id: matchId },
      data: {
        players: match.players + 1,  // Incrementar el número de jugadores
        Usuarios: {
          connectOrCreate: {
            where: {
              partidos_club_id_usuario_id: {
                partidos_club_id: matchId,
                usuario_id: userId
              }
            },
            create: {
              partidos_club_id: matchId,  // Referencia a la relación con partidos_club
              usuario_id: userId          // Referencia a la relación con User
            }
          }
        }
      }
    });
    
    
    
    
    
    console.log('Partido actualizado:', updatedMatch);

    return NextResponse.json(updatedMatch);
  } catch (error) {
    console.error('Error al unirse al partido:', error);
    return NextResponse.json({ error: 'Error al unirse al partido' }, { status: 500 });
  }
}
