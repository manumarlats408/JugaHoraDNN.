// app/api/matches/[id]/leave/route.ts

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
  console.log('Iniciando POST request para retirarse de un partido');
  try {
    const matchId = parseInt(params.id);
    console.log('ID del partido:', matchId);

    // Extraer token y verificar autenticación
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
        include: { Club: true }, // Incluir datos del club
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

      // Actualiza el partido para remover al usuario
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
            }))?.partidosUnidos.filter((id) => id !== matchId) || [],
          },
        },
      });

      console.log('Partido actualizado:', updatedMatch);

      // ✅ Si el partido tenía 4 jugadores y ahora tiene 3, enviar notificaciones
      if (match.players === 4 && updatedMatch.players === 3) {
        console.log('El partido ha pasado de 4 a 3 jugadores, enviando notificaciones...');

        // 🔹 Obtener detalles de los jugadores restantes
        const jugadoresRestantes = await prisma.user.findMany({
          where: { id: { in: updatedMatch.usuarios } },
          select: { firstName: true, email: true },
        });

        // 🔹 Construir la lista de jugadores restantes
        const jugadoresLista = jugadoresRestantes
          .map(jugador => `${jugador.firstName || "Usuario"} (${jugador.email})`)
          .join("<br>");

        // 🔹 Enviar email al club avisando que el partido se abrió nuevamente
        if (match.Club && match.Club.email) {
          await sendgrid.send({
            to: match.Club.email, // Email del club
            from: process.env.SENDGRID_FROM_EMAIL as string,
            subject: "🎾 Partido Abierto Nuevamente",
            html: `
              <h2>🎾 Un jugador se ha retirado de un partido en ${match.Club.name}</h2>
              <p>El partido en la cancha ${match.court} ahora tiene 3 jugadores.</p>
              <h3>📅 Detalles del Partido:</h3>
              <ul>
                <li><strong>📍 Club:</strong> ${match.Club.name}</li>
                <li><strong>📆 Día:</strong> ${match.date.toISOString().split("T")[0]}</li>
                <li><strong>⏰ Hora:</strong> ${match.startTime} - ${match.endTime}</li>
                <li><strong>🏟️ Cancha:</strong> ${match.court}</li>
              </ul>
              <h3>👥 Jugadores actuales:</h3>
              <p>${jugadoresLista}</p>
              <p>Ahora hay un lugar disponible en este partido.</p>
            `
          });
          console.log('Correo enviado al club.');
        }

        // 🔹 Enviar email a los jugadores restantes avisando que hay un lugar libre
        for (const jugador of jugadoresRestantes) {
          await sendgrid.send({
            to: jugador.email,
            from: process.env.SENDGRID_FROM_EMAIL as string,
            subject: "🎾 Un jugador se ha retirado del partido",
            html: `
              <h2>🎾 Un jugador se ha retirado del partido</h2>
              <p>Ahora hay un lugar disponible en el partido en ${match.Club.name}.</p>
              <h3>📅 Detalles del Partido:</h3>
              <ul>
                <li><strong>📆 Día:</strong> ${match.date.toISOString().split("T")[0]}</li>
                <li><strong>⏰ Hora:</strong> ${match.startTime} - ${match.endTime}</li>
                <li><strong>🏟️ Cancha:</strong> ${match.court}</li>
              </ul>
              <p>Revisa la plataforma para ver si hay nuevos jugadores disponibles.</p>
            `
          });
        }
        console.log('Correos enviados a los jugadores restantes.');
      }

      return updatedMatch;
    });

    console.log('Transacción completada exitosamente');
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error al retirarse del partido:', error);
    return NextResponse.json({ error: 'Error al retirarse del partido' }, { status: 400 });
  }
}
