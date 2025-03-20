import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string);

export async function GET() {
  console.log("⏳ Verificando partidos para notificar...");

  try {
    const now = new Date();
    
    // 🔹 Obtener hora actual y las horas futuras
    const horaActual = now.getHours();
    const minutosActual = now.getMinutes();
    const hora24h = `${horaActual.toString().padStart(2, "0")}:${minutosActual.toString().padStart(2, "0")}`;
    const hora12h = `${(horaActual + 12) % 24}:${minutosActual.toString().padStart(2, "0")}`;

    console.log(`🔍 Buscando partidos con startTime en 24h: ${hora24h} o en 12h: ${hora12h}`);

    // 🔹 Buscar partidos llenos en la base de datos
    const partidos = await prisma.partidos_club.findMany({
      where: {
        players: 4, // Partido lleno
        date: {
          equals: new Date(now.toISOString().split("T")[0]), // ✅ Convertir string a DateTime
        },
      },
      include: { Club: true },
    });

    // 🔹 Filtrar partidos con startTime en 24h o 12h
    const partidosFiltrados24h = partidos.filter(p => p.startTime === hora24h);
    const partidosFiltrados12h = partidos.filter(p => p.startTime === hora12h);

    console.log(`✅ Partidos encontrados: 24h=${partidosFiltrados24h.length}, 12h=${partidosFiltrados12h.length}`);

    // 🔹 Notificar jugadores para partidos en 24h
    for (const partido of partidosFiltrados24h) {
      const jugadores = await prisma.user.findMany({
        where: { id: { in: partido.usuarios } },
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

    // 🔹 Notificar jugadores para partidos en 12h
    for (const partido of partidosFiltrados12h) {
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

  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error("❌ Error al enviar notificaciones:", errMessage);
    return NextResponse.json({ error: `Error en la API: ${errMessage}` }, { status: 500 });
  }
}
