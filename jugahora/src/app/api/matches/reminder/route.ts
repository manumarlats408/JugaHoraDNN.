import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string);

export async function GET() {
  console.log("⏳ Verificando partidos para notificar...");

  const ahora = new Date();
  const logs: string[] = [];

  try {
    // 1. Obtener todos los partidos llenos (4 jugadores)
    const partidos = await prisma.partidos_club.findMany({
      where: {
        players: 4,
      },
      include: { Club: true },
    });

    logs.push(`🎯 Partidos llenos encontrados: ${partidos.length}`);

    for (const partido of partidos) {
      // Combinar la fecha (timestamp) con la hora de inicio (text)
      const fecha = partido.date.toISOString().split("T")[0]; // yyyy-mm-dd
      const fechaHoraCompleta = new Date(`${fecha}T${partido.startTime}:00`);

      // Calcular diferencia en horas
      const diferenciaMs = fechaHoraCompleta.getTime() - ahora.getTime();
      const diferenciaHoras = diferenciaMs / (1000 * 60 * 60);

      const jugadores = await prisma.user.findMany({
        where: { id: { in: partido.usuarios } },
        select: { email: true, firstName: true },
      });

      if (Math.abs(diferenciaHoras - 24) < 0.5) {
        logs.push(`📨 Enviando notificación 24h para partido ID ${partido.id}`);

        for (const jugador of jugadores) {
          await sendgrid.send({
            to: jugador.email,
            from: process.env.SENDGRID_FROM_EMAIL as string,
            subject: "⏳ Faltan 24 horas para tu partido",
            html: `
              <h2>⏳ Faltan 24 horas para tu partido</h2>
              <p>Hola ${jugador.firstName || "jugador"},</p>
              <p>Tu partido en <strong>${partido.Club.name}</strong> es mañana.</p>
              <h3>📅 Detalles del Partido:</h3>
              <ul>
                <li><strong>📆 Día:</strong> ${fecha}</li>
                <li><strong>⏰ Hora:</strong> ${partido.startTime} - ${partido.endTime}</li>
                <li><strong>🏟️ Cancha:</strong> ${partido.court}</li>
              </ul>
              <p>Si no podés asistir, tenés 12 horas para cancelarlo desde la plataforma.</p>
              <p>Gracias por usar <strong>JugáHora</strong>.</p>
            `,
          });
        }
      }

      if (Math.abs(diferenciaHoras - 12) < 0.5) {
        logs.push(`📨 Enviando notificación 12h para partido ID ${partido.id}`);

        for (const jugador of jugadores) {
          await sendgrid.send({
            to: jugador.email,
            from: process.env.SENDGRID_FROM_EMAIL as string,
            subject: "⚠️ Faltan 12 horas para tu partido - No se permiten cancelaciones",
            html: `
              <h2>⚠️ Faltan 12 horas para tu partido</h2>
              <p>Hola ${jugador.firstName || "jugador"},</p>
              <p>Tu partido en <strong>${partido.Club.name}</strong> comienza en menos de 12 horas.</p>
              <h3>📅 Detalles del Partido:</h3>
              <ul>
                <li><strong>📆 Día:</strong> ${fecha}</li>
                <li><strong>⏰ Hora:</strong> ${partido.startTime} - ${partido.endTime}</li>
                <li><strong>🏟️ Cancha:</strong> ${partido.court}</li>
              </ul>
              <p>Ya no es posible cancelar. En caso de no presentarte, podrías recibir una penalización.</p>
              <p>Gracias por usar <strong>JugáHora</strong>.</p>
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
    console.error("❌ Error en el proceso de recordatorios:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
