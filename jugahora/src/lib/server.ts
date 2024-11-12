// server.ts (o cron.ts)

import cron from 'node-cron';
import { notifyPartidoProximo24Horas } from './notification'; // Asegúrate de que la ruta sea correcta

// Ejecutar la tarea cada hora
cron.schedule('0 * * * *', async () => {
  console.log('Ejecutando la notificación de partidos próximos en 24 horas');
  try {
    await notifyPartidoProximo24Horas();
  } catch (error) {
    console.error('Error al ejecutar la notificación de partidos próximos:', error);
  }
});
