// app/api/matches/notifications/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string);

export async function GET() {
  console.log("⏳ Verificando partidos para notificar...");

  try {
    // Obtener la fecha y hora actual
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in12Hours = new Date(now.getTime() + 12 * 60 * 60 * 1000);

    // 🔹 Buscar partidos llenos que comienzan en 24h o en 12h
    const partidos24h = await prisma.partidos_club.findMany({
        where: {
          players: 4, // Partido lleno
          date: {
            gte: new Date(now.toISOString().split("T")[0]), // Desde hoy
            lte: new Date(in24Hours.toISOString().split("T")[0]), // Hasta 24h después
          },
        },
        include: { Club: true }, // ❌ No podemos incluir `usuarios` directamente
      });

      const partidos12h = await prisma.partidos_club.findMany({
        where: {
          players: 4, // Partido lleno
          date: {
            gte: new Date(now.toISOString().split("T")[0]), // Desde hoy
            lte: new Date(in12Hours.toISOString().split("T")[0]), // Hasta 24h después
          },
        },
        include: { Club: true }, // ❌ No podemos incluir `usuarios` directamente
      });


    
// 🔹 Obtener los jugadores manualmente
for (const partido of partidos24h) {
    const jugadores = await prisma.user.findMany({
      where: { id: { in: partido.usuarios } }, // Buscar por los IDs del array `usuarios`
      select: { email: true, firstName: true },
    });
  
    // 🔹 Enviar emails a los jugadores
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
            <li><strong>📆 Día:</strong> ${partido.date.toISOString().split("T")[0]}</li>
            <li><strong>⏰ Hora:</strong> ${partido.startTime} - ${partido.endTime}</li>
            <li><strong>🏟️ Cancha:</strong> ${partido.court}</li>
          </ul>
          <p>Si no puedes asistir, por favor cancela en las próximas 12 horas, ya que luego no se permitirán cancelaciones.</p>
          <p>Gracias por utilizar <strong>JugáHora</strong>.</p>
        `,
      });
    }
  }

// 🔹 Notificar a los jugadores de partidos que comienzan en 12h
for (const partido of partidos12h) {
    const jugadores = await prisma.user.findMany({
        where: { id: { in: partido.usuarios } }, // Buscar por los IDs del array `usuarios`
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
              <li><strong>📆 Día:</strong> ${partido.date.toISOString().split("T")[0]}</li>
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
