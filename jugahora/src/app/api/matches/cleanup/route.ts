import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function DELETE() {
  try {
    const now = new Date(new Date().getTime() - 3 * 60 * 60 * 1000); // UTC-3
    const logs: string[] = [];

    logs.push(`🕒 Hora actual ARG (UTC-3): ${now.toISOString()}`);

    const partidos = await prisma.partidos_club.findMany();

    const partidosParaBorrar = partidos.filter((partido) => {
      const fecha = partido.date.toISOString().split("T")[0];
      const end = partido.endTime || "00:00";
      const [hh, mm] = end.split(":");
      const endDate = new Date(`${fecha}T${hh.padStart(2, '0')}:${mm.padStart(2, '0')}:00`);

      return endDate < now;
    });

    const idsAEliminar = partidosParaBorrar.map(p => p.id);

    if (idsAEliminar.length > 0) {
      await prisma.partidos_club.deleteMany({
        where: { id: { in: idsAEliminar } },
      });
    }

    logs.push(`🗑️ Partidos eliminados: ${idsAEliminar.length}`);
    console.log(logs.join('\n'));

    return NextResponse.json({ eliminados: idsAEliminar.length, logs });
  } catch (error) {
    console.error('❌ Error al eliminar partidos pasados:', error);
    return NextResponse.json({ error: 'Error al eliminar partidos pasados' }, { status: 500 });
  }
}
