// app/api/matches/[id]/join/route.ts

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
  console.log('Iniciando POST request para unirse a un partido');
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

    // Iniciar transacción para agregar al usuario al partido
    const result = await prisma.$transaction(async (prisma) => {
      console.log('Buscando partido...');
      const match = await prisma.partidos_club.findUnique({
        where: { id: matchId },
        include: { Club: true }, // Incluir info del club
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
      
      // Agregar usuario al partido
      const updatedMatch = await prisma.partidos_club.update({
        where: { id: matchId },
        data: {
          players: match.players + 1,
          usuarios: {
            push: userId,
          },
        },
      });

      // Agregar partido a la lista de partidos del usuario
      await prisma.user.update({
        where: { id: userId },
        data: {
          partidosUnidos: {
            push: matchId,
          },
        },
      });

      console.log('Partido actualizado:', updatedMatch);

      // ✅ Si el partido se llena, enviamos el email al club
      if (updatedMatch.players === updatedMatch.maxPlayers) {
        console.log('El partido se ha llenado, enviando email al club...');

        // Verificar que el partido tiene un club asignado
        if (match.Club && match.Club.email) {
          await sendgrid.send({
            to: match.Club.email, // Email del club que creó el partido
            from: process.env.SENDGRID_FROM_EMAIL as string,
            subject: "🎾 Partido Completo - Notificación",
            html: `
              <h2>🎾 El partido en ${match.Club.name} está completo!</h2>
              <p>Ya se han unido 4 jugadores al partido en la cancha ${match.court}.</p>
              <p>Fecha: ${match.date}</p>
              <p>Hora: ${match.startTime} - ${match.endTime}</p>
              <p>Por favor, revisa la plataforma para gestionar la reserva.</p>
            `
          });
          console.log('Correo enviado al club correctamente.');
        } else {
          console.error('Error: No se encontró email del club.');
        }
      }

      return updatedMatch;
    });

    console.log('Transacción completada exitosamente');
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error al unirse al partido:', error);
    return NextResponse.json({ error: 'Error al unirse al partido' }, { status: 400 });
  }
}
