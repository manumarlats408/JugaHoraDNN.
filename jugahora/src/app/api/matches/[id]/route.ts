import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const matchId = parseInt(params.id);

  try {
    // Find users who joined this match
    const usersToUpdate = await prisma.user.findMany({
      where: {
        partidosUnidos: {
          has: matchId,  // Find users where `partidosUnidos` contains the matchId
        },
      },
      select: { id: true, partidosUnidos: true },
    });

    // Update each user to remove the matchId from their `partidosUnidos` array
    await Promise.all(usersToUpdate.map(async (user) => {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          partidosUnidos: {
            set: user.partidosUnidos.filter((id) => id !== matchId), // Remove matchId
          },
        },
      });
    }));

    // Now delete the match from `partidos_club`
    await prisma.partidos_club.delete({
      where: { id: matchId },
    });

    return NextResponse.json({ message: 'Partido eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el partido:', error);
    return NextResponse.json({ error: 'Error al eliminar el partido' }, { status: 500 });
  }
}
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const matchId = parseInt(params.id);

  try {
    const { date, time, court } = await request.json();

    console.log("Datos recibidos para actualización:", { date, time, court });

    const updatedMatch = await prisma.partidos_club.update({
      where: { id: matchId },
      data: {
        date: new Date(date),
        time,
        court,
      },
    });

    console.log("Partido actualizado:", updatedMatch);
    return NextResponse.json(updatedMatch);
  } catch (error) {
    console.error('Error al actualizar el partido:', error);
    return NextResponse.json({ error: 'Error al actualizar el partido' }, { status: 500 });
  }
}
