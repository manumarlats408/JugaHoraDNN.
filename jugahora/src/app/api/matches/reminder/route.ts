import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import sendgrid from "@sendgrid/mail"

sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string)

export async function GET() {
  const logs = ["⏳ Verificando partidos para notificar..."]

  try {
    const now = new Date()
    logs.push(`📅 Fecha y hora actual: ${now.toISOString()}`)

    // Obtener todos los partidos llenos
    const partidos = await prisma.partidos_club.findMany({
      where: {
        players: 4, // Partido lleno
      },
      include: { Club: true },
    })

    logs.push(`📊 Total partidos encontrados: ${partidos.length}`)

    // Información detallada de los partidos para debugging
    const partidosInfo = partidos.map((p) => ({
      id: p.id,
      fecha: p.date.toISOString().split("T")[0],
      hora: p.startTime,
      jugadores: p.usuarios.length,
      club: p.Club.name,
    }))
    logs.push(`📊 Detalles de partidos: ${JSON.stringify(partidosInfo)}`)

    // Arrays para almacenar partidos que necesitan notificación
    const partidos24h = []
    const partidos12h = []

    // Revisar cada partido para ver si necesita notificación
    for (const partido of partidos) {
      // Convertir la fecha y hora del partido a un objeto Date
      const partidoDate = new Date(partido.date)
      const [hours, minutes] = partido.startTime.split(":").map(Number)
      partidoDate.setHours(hours, minutes, 0, 0)

      // Calcular la diferencia en horas
      const diffMs = partidoDate.getTime() - now.getTime()
      const diffHours = diffMs / (1000 * 60 * 60)

      logs.push(
        `📊 Partido ID ${partido.id}: fecha ${partidoDate.toISOString()}, hora ${partido.startTime}, diferencia: ${diffHours.toFixed(2)} horas`,
      )

      // Verificar si el partido está a ~24 horas (entre 23.5 y 24.5 horas)
      if (diffHours >= 23.5 && diffHours <= 24.5) {
        partidos24h.push(partido)
        logs.push(`✅ Partido ID ${partido.id} seleccionado para notificación de 24h`)
      }

      // Verificar si el partido está a ~12 horas (entre 11.5 y 12.5 horas)
      if (diffHours >= 11.5 && diffHours <= 12.5) {
        partidos12h.push(partido)
        logs.push(`✅ Partido ID ${partido.id} seleccionado para notificación de 12h`)
      }
    }

    logs.push(`📊 Partidos para notificar: 24h=${partidos24h.length}, 12h=${partidos12h.length}`)

    // Enviar notificaciones para partidos de 24h
    for (const partido of partidos24h) {
      const jugadores = await prisma.user.findMany({
        where: { id: { in: partido.usuarios } },
        select: { email: true, firstName: true },
      })

      logs.push(`📊 Jugadores para partido ${partido.id}: ${jugadores.length}`)

      for (const jugador of jugadores) {
        logs.push(`📩 Enviando notificación de 24h a: ${jugador.email}`)
        try {
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
          })
          logs.push(`✅ Email enviado a ${jugador.email} para partido de 24h`)
        } catch (emailError) {
          logs.push(`❌ Error al enviar email a ${jugador.email}: ${emailError}`)
        }
      }
    }

    // Enviar notificaciones para partidos de 12h
    for (const partido of partidos12h) {
      const jugadores = await prisma.user.findMany({
        where: { id: { in: partido.usuarios } },
        select: { email: true, firstName: true },
      })

      logs.push(`📊 Jugadores para partido ${partido.id}: ${jugadores.length}`)

      for (const jugador of jugadores) {
        logs.push(`📩 Enviando notificación de 12h a: ${jugador.email}`)
        try {
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
          })
          logs.push(`✅ Email enviado a ${jugador.email} para partido de 12h`)
        } catch (emailError) {
          logs.push(`❌ Error al enviar email a ${jugador.email}: ${emailError}`)
        }
      }
    }

    logs.push("✅ Proceso de notificaciones completado.")

    // Devolver todos los logs en la respuesta para mejor debugging
    return NextResponse.json({
      success: true,
      message: "Proceso de notificaciones completado",
      stats: {
        partidos24h: partidos24h.length,
        partidos12h: partidos12h.length,
        total: partidos.length,
      },
      logs: logs,
      partidosInfo: partidosInfo,
    })
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Error desconocido"
    console.error("❌ Error al enviar notificaciones:", errMessage)
    if (error instanceof Error && error.stack) {
      console.error("Stack trace:", error.stack)
    }
    return NextResponse.json(
      {
        error: `Error en la API: ${errMessage}`,
        logs: logs,
      },
      { status: 500 },
    )
  }
}

