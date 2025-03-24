import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string);

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const matchId = parseInt(params.id);
    const token = cookies().get('token')?.value;
    const userId = await verifyAuth(token);

    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Obtener datos del jugador (nivel)
    const jugador = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, nivel: true, firstName: true, email: true },
    });

    if (!jugador || jugador.nivel == null) {
      return NextResponse.json({ error: 'No se encontró el jugador o no tiene nivel asignado' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (prisma) => {
      const match = await prisma.partidos_club.findUnique({
        where: { id: matchId },
        include: { Club: true },
      });

      if (!match) throw new Error('Partido no encontrado');
      if (match.players >= match.maxPlayers) throw new Error('El partido está completo');
      if (match.usuarios.includes(userId)) throw new Error('Ya estás unido a este partido');

      // Validación de categoría
      if (match.players === 0) {
        // Primera persona, se asigna su nivel como categoría
        await prisma.partidos_club.update({
          where: { id: matchId },
          data: { categoria: jugador.nivel },
        });
      } else {
        // Validar que coincida con la categoría
        if (match.categoria == null) {
          throw new Error('Este partido no tiene categoría definida');
        }

        if (jugador.nivel !== match.categoria) {
          throw new Error(`Este partido es para nivel ${match.categoria}. Tu nivel actual es ${jugador.nivel}.`);
        }
        
      }

      const updatedMatch = await prisma.partidos_club.update({
        where: { id: matchId },
        data: {
          players: match.players + 1,
          usuarios: {
            push: userId,
          },
        },
      });

      // Notificar al club si se llenó el partido
      if (updatedMatch.players === updatedMatch.maxPlayers && match.Club?.email) {
        const jugadores = await prisma.user.findMany({
          where: { id: { in: updatedMatch.usuarios } },
          select: { firstName: true, email: true },
        });

        const jugadoresLista = jugadores
          .map(j => `${j.firstName || 'Jugador'} (${j.email})`)
          .join("<br>");

        await sendgrid.send({
          to: match.Club.email,
          from: process.env.SENDGRID_FROM_EMAIL as string,
          subject: "🎾 Partido Completo - Detalles",
          html: `
            <h2>🎾 ¡El partido en ${match.Club.name} está completo!</h2>
            <p>Ya se han unido 4 jugadores al partido.</p>
            <ul>
              <li><strong>📆 Día:</strong> ${match.date.toISOString().split("T")[0]}</li>
              <li><strong>⏰ Hora:</strong> ${match.startTime} - ${match.endTime}</li>
              <li><strong>🏟️ Cancha:</strong> ${match.court}</li>
            </ul>
            <h3>👥 Jugadores:</h3>
            ${jugadoresLista}
          `,
        });
      }

      return updatedMatch;
    });

    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error al unirse al partido:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
