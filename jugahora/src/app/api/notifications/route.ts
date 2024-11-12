// /pages/api/notifications.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Asegurarse de que el valor de clubId es un número
    const clubId = Array.isArray(req.query.clubId) ? req.query.clubId[0] : req.query.clubId;
    const clubIdNumber = parseInt(clubId as string, 10); // Convertirlo a número

    if (isNaN(clubIdNumber)) {
      return res.status(400).json({ error: 'El parámetro clubId es inválido.' });
    }

    try {
      const notifications = await prisma.notification.findMany({
        where: {
          clubId: clubIdNumber, // Usar el clubId como número
        },
        orderBy: {
          createdAt: 'desc', // Ordena por la fecha de creación
        },
      });
      res.status(200).json(notifications);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener las notificaciones' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
