import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string);

/**
 * 🔴 DELETE - Cuando un club elimina un partido
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const matchId = parseInt(params.id);

  try {
    // 🔹 Obtener jugadores del partido antes de eliminarlo
    const match = await prisma.partidos_club.findUnique({
      where: { id: matchId },
      select: { usuarios: true, Club: true },
    });

    if (!match) {
      return NextResponse.json({ error: 'Partido no encontrado' }, { status: 404 });
    }

    // 🔹 Obtener los emails de los jugadores inscritos
    const jugadores = await prisma.user.findMany({
      where: { id: { in: match.usuarios } },
      select: { email: true, firstName: true },
    });

    // 🔹 Eliminar el partido
    await prisma.partidos_club.delete({ where: { id: matchId } });

    // 🔹 Enviar email a los jugadores avisando que el partido fue cancelado
    for (const jugador of jugadores) {
      await sendgrid.send({
        to: jugador.email,
        from: process.env.SENDGRID_FROM_EMAIL as string,
        subject: "⚠️ Partido Cancelado",
        html: `
          <h2>⚠️ Partido Cancelado</h2>
          <p>Hola ${jugador.firstName || "jugador"},</p>
          <p>Lamentamos informarte que el partido en <strong>${match.Club?.name || "tu club"}</strong> ha sido cancelado.</p>
          <p>Por favor, revisa la plataforma para encontrar otro partido disponible.</p>
          <p>Gracias por utilizar <strong>JugáHora</strong>.</p>
        `,
      });
    }

    console.log("Notificaciones enviadas a los jugadores.");
    return NextResponse.json({ message: 'Partido eliminado correctamente y jugadores notificados' });

  } catch (error) {
    console.error('Error al eliminar el partido:', error);
    return NextResponse.json({ error: 'Error al eliminar el partido' }, { status: 500 });
  }
}

/**
 * ✏️ PATCH - Cuando un club edita un partido
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const matchId = parseInt(params.id);

  try {
    // 🔹 Obtener datos antes de la actualización
    const oldMatch = await prisma.partidos_club.findUnique({
      where: { id: matchId },
      select: { date: true, startTime: true, endTime: true, court: true, price: true, usuarios: true, Club: true },
    });

    if (!oldMatch) {
      return NextResponse.json({ error: 'Partido no encontrado' }, { status: 404 });
    }

    // 🔹 Obtener los nuevos datos
    const { date, startTime, endTime, court, price } = await request.json();
    console.log("Datos recibidos para actualización:", { date, startTime, endTime, court, price });

    // 🔹 Actualizar partido
    const updatedMatch = await prisma.partidos_club.update({
      where: { id: matchId },
      data: {
        date: new Date(date),
        startTime,
        endTime,
        court,
        price,
      },
    });

    console.log("Partido actualizado:", updatedMatch);

    // 🔹 Determinar qué datos han cambiado
    const cambios: string[] = [];
    if (oldMatch.date.toISOString().split("T")[0] !== new Date(date).toISOString().split("T")[0]) {
      cambios.push(`<strong>Fecha:</strong> ${oldMatch.date.toISOString().split("T")[0]} ➝ ${new Date(date).toISOString().split("T")[0]}`);
    }
    if (oldMatch.startTime !== startTime || oldMatch.endTime !== endTime) {
      cambios.push(`<strong>Hora:</strong> ${oldMatch.startTime} - ${oldMatch.endTime} ➝ ${startTime} - ${endTime}`);
    }
    if (oldMatch.court !== court) {
      cambios.push(`<strong>Cancha:</strong> ${oldMatch.court} ➝ ${court}`);
    }
    if (oldMatch.price !== price) {
      cambios.push(`<strong>Precio:</strong> $${oldMatch.price} ➝ $${price}`);
    }

    // 🔹 Obtener los emails de los jugadores inscritos
    const jugadores = await prisma.user.findMany({
      where: { id: { in: oldMatch.usuarios } },
      select: { email: true, firstName: true },
    });

    // 🔹 Enviar email a los jugadores con los cambios
    for (const jugador of jugadores) {
      await sendgrid.send({
        to: jugador.email,
        from: process.env.SENDGRID_FROM_EMAIL as string,
        subject: "📢 Partido Actualizado",
        html: `
          <h2>📢 Partido Modificado</h2>
          <p>Hola ${jugador.firstName || "jugador"},</p>
          <p>El partido en <strong>${oldMatch.Club?.name || "tu club"}</strong> ha sido modificado.</p>
          <h3>🔄 Cambios:</h3>
          <ul>${cambios.map(cambio => `<li>${cambio}</li>`).join("")}</ul>
          <p>Por favor, revisa la plataforma para confirmar tu asistencia.</p>
          <p>Gracias por utilizar <strong>JugáHora</strong>.</p>
        `,
      });
    }

    console.log("Notificaciones enviadas a los jugadores.");
    return NextResponse.json(updatedMatch);

  } catch (error) {
    console.error('Error al actualizar el partido:', error);
    return NextResponse.json({ error: 'Error al actualizar el partido' }, { status: 500 });
  }
}
