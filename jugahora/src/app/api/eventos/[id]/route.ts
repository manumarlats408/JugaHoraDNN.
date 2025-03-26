import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string);

/**
 * 🔴 DELETE - Cuando un club elimina un evento
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const eventoId = parseInt(params.id);

  try {
    const evento = await prisma.evento_club.findUnique({
      where: { id: eventoId },
      include: { Club: true },
    });

    if (!evento) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    // 🔹 Eliminar evento
    await prisma.evento_club.delete({ where: { id: eventoId } });

    // 🔹 (Opcional) enviar email a los jugadores si guardás las parejas anotadas en otra tabla

    return NextResponse.json({ message: 'Evento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el evento:', error);
    return NextResponse.json({ error: 'Error al eliminar el evento' }, { status: 500 });
  }
}

/**
 * ✏️ PATCH - Cuando un club edita un evento
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const eventoId = parseInt(params.id);

  try {
    const oldEvento = await prisma.evento_club.findUnique({
      where: { id: eventoId },
    });

    if (!oldEvento) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    const {
      nombre,
      date,
      startTime,
      endTime,
      categoria,
      genero,
      tipo,
      formato,
      maxParejas,
    } = await request.json();

    const updatedEvento = await prisma.evento_club.update({
      where: { id: eventoId },
      data: {
        nombre,
        date: new Date(date),
        startTime,
        endTime,
        categoria,
        genero,
        tipo,
        formato: tipo === "torneo" ? formato : null,
        maxParejas: parseInt(maxParejas),
      },
    });

    return NextResponse.json(updatedEvento);
  } catch (error) {
    console.error('Error al actualizar el evento:', error);
    return NextResponse.json({ error: 'Error al actualizar el evento' }, { status: 500 });
  }
}
