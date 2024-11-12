// lib/notifications.ts

import prisma from './prisma'; // Asegúrate de que la ruta sea la correcta
import { addHours } from 'date-fns';

// 1. Notificación de partido completo
export async function notifyPartidoCompleto(partidoId: number): Promise<void> {
  const partido = await prisma.partidos_club.findUnique({
    where: { id: partidoId },
    include: { Club: true }
  });

  if (partido && partido.players === partido.maxPlayers) {
    await prisma.notification.create({
      data: {
        clubId: partido.clubId,
        message: 'El partido ha alcanzado el máximo de jugadores.',
        type: 'PARTIDO_COMPLETO'
      }
    });
  }
}

// 2. Notificación de partido borrado
export async function notifyPartidoBorrado(partidoId: number): Promise<void> {
  const partido = await prisma.partidos_club.findUnique({
    where: { id: partidoId },
    include: { Club: true }
  });

  if (partido) {
    await prisma.notification.create({
      data: {
        clubId: partido.clubId,
        message: 'Un partido ha sido borrado.',
        type: 'PARTIDO_BORRADO'
      }
    });
  }
}

// 3. Notificación 24 horas antes de un partido completo
export async function notifyPartidoProximo24Horas(): Promise<void> {
  const partidos = await prisma.partidos_club.findMany({
    where: {
      players: 4,
      date: { gte: new Date() } // Solo partidos futuros
    }
  });

  const now = new Date();
  for (const partido of partidos) {
    const startTime = addHours(partido.date, parseInt(partido.startTime.split(':')[0], 10)); // Ajuste de la hora de inicio
    const timeDifference = startTime.getTime() - now.getTime();

    if (timeDifference <= 24 * 60 * 60 * 1000) { // 24 horas en milisegundos
      await prisma.notification.create({
        data: {
          clubId: partido.clubId,
          message: 'Faltan menos de 24 horas para el inicio de un partido completo.',
          type: 'PARTIDO_PROXIMO'
        }
      });
    }
  }
}

export async function getNotifications(clubId: number): Promise<any[]> {
  const response = await fetch(`/api/notifications?clubId=${clubId}`);
  if (!response.ok) {
    throw new Error('Error al obtener las notificaciones');
  }
  return response.json();
}
