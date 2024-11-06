import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const matchId = parseInt(params.id);

  try {
    await prisma.partidos_club.delete({
      where: { id: matchId },
    });
    return NextResponse.json({ message: 'Partido eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el partido:', error);
    return NextResponse.json({ error: 'Error al eliminar el partido' }, { status: 500 });
  }
}
