export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string);

export async function GET() {
  console.log("⏳ Verificando partidos para notificar...");

  const ahora = new Date(new Date().getTime() - 3 * 60 * 60 * 1000);

  const logs: string[] = [];

  logs.push(`🕒 Hora actual (ARG): ${ahora.toISOString()}`);


  try {
    const partidos = await prisma.partidos_club.findMany({
      where: {
        players: 4,
      },
      include: { Club: true },
    });

    logs.push(`🎯 Partidos llenos encontrados: ${partidos.length}`);

    for (const partido of partidos) {
      const fecha = partido.date.toISOString().split("T")[0]; // yyyy-mm-dd
      const partidoDateTime = new Date(`${fecha}T${partido.startTime}:00`);

      // Calcular diferencia
      const diferenciaMs = partidoDateTime.getTime() - ahora.getTime();
      const diferenciaHoras = diferenciaMs / (1000 * 60 * 60);

      logs.push(`📌 Partido ID ${partido.id} - Hora de inicio: ${partidoDateTime.toISOString()} - Diferencia: ${diferenciaHoras.toFixed(2)} horas`);

      const jugadores = await prisma.user.findMany({
        where: { id: { in: partido.usuarios } },
        select: { email: true, firstName: true },
      });

      if (Math.abs(diferenciaHoras - 24) < 0.5) {
        logs.push(`📨 Enviando notificación de 24h para partido ID ${partido.id}`);

        for (const jugador of jugadores) {
          await sendgrid.send({
            to: jugador.email,
            from: process.env.SENDGRID_FROM_EMAIL as string,
            subject: "⏳ Faltan 24 horas para tu partido",
            html: `
              <h2>⏳ Faltan 24 horas para tu partido</h2>
              <p>Hola ${jugador.firstName || "jugador"},</p>
              <p>Tu partido en <strong>${partido.Club.name}</strong> es mañana.</p>
              <p><strong>🕒 Hora:</strong> ${partido.startTime} - ${partido.endTime}</p>
              <p><strong>📆 Día:</strong> ${fecha}</p>
            `,
          });
        }
      }

      if (Math.abs(diferenciaHoras - 12) < 0.5) {
        logs.push(`📨 Enviando notificación de 12h para partido ID ${partido.id}`);

        for (const jugador of jugadores) {
          await sendgrid.send({
            to: jugador.email,
            from: process.env.SENDGRID_FROM_EMAIL as string,
            subject: "⚠️ Faltan 12 horas para tu partido - No se permiten cancelaciones",
            html: `
              <h2>⚠️ Faltan 12 horas para tu partido</h2>
              <p>Hola ${jugador.firstName || "jugador"},</p>
              <p>Tu partido en <strong>${partido.Club.name}</strong> comienza en menos de 12 horas.</p>
              <p><strong>🕒 Hora:</strong> ${partido.startTime} - ${partido.endTime}</p>
              <p><strong>📆 Día:</strong> ${fecha}</p>
            `,
          });
        }
      }
    }

    logs.push("✅ Verificación finalizada.");
    console.log(logs.join("\n"));

    return NextResponse.json({ message: "Notificaciones procesadas correctamente", logs });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error desconocido";
    console.error("❌ Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
