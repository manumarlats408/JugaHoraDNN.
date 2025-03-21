export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string);

export async function GET() {
  // Usamos hora actual ajustada a horario argentino (UTC-3)
  const ahora = new Date(new Date().getTime() - 3 * 60 * 60 * 1000);
  const logs: string[] = [];

  logs.push(`🕒 Hora actual ARG (UTC-3): ${ahora.toISOString()}`);

  try {
    // Obtenemos todos los partidos llenos
    const partidos = await prisma.partidos_club.findMany({
      where: {
        players: 4,
      },
      include: { Club: true },
    });

    logs.push(`🎯 Partidos llenos encontrados: ${partidos.length}`);

    for (const partido of partidos) {
      const fecha = partido.date.toISOString().split("T")[0];
      const partidoDateTime = new Date(`${fecha}T${partido.startTime}:00`);
      const diferenciaMs = partidoDateTime.getTime() - ahora.getTime();
      const diferenciaHoras = diferenciaMs / (1000 * 60 * 60);

      logs.push(`📌 Partido ID ${partido.id} inicia a ${partidoDateTime.toISOString()} → faltan ${diferenciaHoras.toFixed(2)}h`);

      const jugadores = await prisma.user.findMany({
        where: { id: { in: partido.usuarios } },
        select: { email: true, firstName: true },
      });

      // Enviar mail si faltan 24h y aún no fue enviado
      if (!partido.mail24h && Math.abs(diferenciaHoras - 24) < 0.5) {
        logs.push(`📨 Enviando mail 24h para partido ${partido.id}`);

        for (const jugador of jugadores) {
          await sendgrid.send({
            to: jugador.email,
            from: process.env.SENDGRID_FROM_EMAIL as string,
            subject: "⏳ Faltan 24 horas para tu partido",
            html: `
              <h2>⏳ Faltan 24 horas para tu partido</h2>
              <p>Hola ${jugador.firstName || "jugador"},</p>
              <p>Tu partido en <strong>${partido.Club.name}</strong> está programado para mañana.</p>
              <h3>📅 Detalles del Partido:</h3>
              <ul>
                <li><strong>📆 Día:</strong> ${fecha}</li>
                <li><strong>⏰ Hora:</strong> ${partido.startTime} - ${partido.endTime}</li>
                <li><strong>🏟️ Cancha:</strong> ${partido.court}</li>
              </ul>
              <p>Si no podés asistir, cancelá dentro de las próximas 12 horas.</p>
            `,
          });
        }

        // Marcar que ya se envió el mail de 24h
        await prisma.partidos_club.update({
          where: { id: partido.id },
          data: { mail24h: true },
        });
      }

      // Enviar mail si faltan 12h y aún no fue enviado
      if (!partido.mail12h && Math.abs(diferenciaHoras - 12) < 0.5) {
        logs.push(`📨 Enviando mail 12h para partido ${partido.id}`);

        for (const jugador of jugadores) {
          await sendgrid.send({
            to: jugador.email,
            from: process.env.SENDGRID_FROM_EMAIL as string,
            subject: "⚠️ Faltan 12 horas para tu partido - No se permiten cancelaciones",
            html: `
              <h2>⚠️ Faltan 12 horas para tu partido</h2>
              <p>Hola ${jugador.firstName || "jugador"},</p>
              <p>Tu partido en <strong>${partido.Club.name}</strong> comienza pronto.</p>
              <h3>📅 Detalles del Partido:</h3>
              <ul>
                <li><strong>📆 Día:</strong> ${fecha}</li>
                <li><strong>⏰ Hora:</strong> ${partido.startTime} - ${partido.endTime}</li>
                <li><strong>🏟️ Cancha:</strong> ${partido.court}</li>
              </ul>
              <p>Las cancelaciones ya no están permitidas. En caso de no presentarte, podrías recibir una penalización.</p>
            `,
          });
        }

        // Marcar que ya se envió el mail de 12h
        await prisma.partidos_club.update({
          where: { id: partido.id },
          data: { mail12h: true },
        });
      }
    }

    logs.push("✅ Proceso de notificaciones finalizado.");
    console.log(logs.join("\n"));

    return NextResponse.json({ message: "Notificaciones procesadas correctamente", logs });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error desconocido";
    console.error("❌ Error en recordatorios:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
