// app/api/matches/reminder/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string);

export async function GET() {
  console.log("⏳ Verificando partidos para notificar...");

  try {
    // Obtener la fecha y hora actual
    const now = new Date();

    // Calcular la hora en 24h y 12h
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const formatted24h = `${String(in24Hours.getHours()).padStart(2, "0")}:${String(in24Hours.getMinutes()).padStart(2, "0")}`;

    const in12Hours = new Date(now.getTime() + 12 * 60 * 60 * 1000);
    const formatted12h = `${String(in12Hours.getHours()).padStart(2, "0")}:${String(in12Hours.getMinutes()).padStart(2, "0")}`;

    console.log(`🔍 Buscando partidos con startTime en 24h: ${formatted24h} o en 12h: ${formatted12h}`);

    // 🔹 Buscar partidos que comienzan en 24h
    const partidos24h = await prisma.partidos_club.findMany({
      where: {
        players: 4, // Partido lleno
        date: now.toISOString().split("T")[0], // La fecha de hoy
        startTime: formatted24h, // Hora exacta en 24h
      },
      include: { Club: true },
    });

    // 🔹 Buscar partidos que comienzan en 12h
    const partidos12h = await prisma.partidos_club.findMany({
      where: {
        players: 4, // Partido lleno
        date: now.toISOString().split("T")[0], // La fecha de hoy
        startTime: formatted12h, // Hora exacta en 12h
      },
      include: { Club: true },
    });

    console.log(`📌 Partidos en 24h encontrados: ${partidos24h.length}`);
    console.log(`📌 Partidos en 12h encontrados: ${partidos12h.length}`);

    // 🔹 Enviar notificaciones a jugadores de partidos en 24h
    for (const partido of partidos24h) {
      const jugadores = await prisma.user.findMany({
        where: { id: { in: partido.usuarios } }, // Buscar por los IDs del array `usuarios`
        select: { email: true, firstName: true },
      });

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
              <li><strong>📆 Día:</strong> ${partido.date}</li>
              <li><strong>⏰ Hora:</strong> ${partido.startTime} - ${partido.endTime}</li>
              <li><strong>🏟️ Cancha:</strong> ${partido.court}</li>
            </ul>
            <p>Si no puedes asistir, por favor cancela en las próximas 12 horas, ya que luego no se permitirán cancelaciones.</p>
            <p>Gracias por utilizar <strong>JugáHora</strong>.</p>
          `,
        });
      }
    }

    // 🔹 Enviar notificaciones a jugadores de partidos en 12h
    for (const partido of partidos12h) {
      const jugadores = await prisma.user.findMany({
        where: { id: { in: partido.usuarios } },
        select: { email: true, firstName: true },
      });

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
              <li><strong>📆 Día:</strong> ${partido.date}</li>
              <li><strong>⏰ Hora:</strong> ${partido.startTime} - ${partido.endTime}</li>
              <li><strong>🏟️ Cancha:</strong> ${partido.court}</li>
            </ul>
            <p>Las cancelaciones ya no están permitidas. En caso de no presentarte, podrías recibir una penalización.</p>
            <p>Gracias por utilizar <strong>JugáHora</strong>.</p>
          `,
        });
      }
    }

    console.log("✅ Notificaciones enviadas correctamente.");
    return NextResponse.json({ message: "Notificaciones enviadas correctamente" });

  } catch (error) {
    console.error("❌ Error al enviar notificaciones:", error);
    return NextResponse.json({ error: "Error al enviar notificaciones" }, { status: 500 });
  }
}
