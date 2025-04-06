import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import sendgrid from "@sendgrid/mail"
import { generarEmailHTML, formatearFechaDDMMYYYY } from "@/lib/emailUtils"

sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string)

/**
 * 🔴 DELETE - Eliminar evento y notificar
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const eventoId = parseInt(params.id)

  try {
    const evento = await prisma.evento_club.findUnique({
      where: { id: eventoId },
      select: {
        nombre: true,
        date: true,
        startTime: true,
        endTime: true,
        tipo: true,
        inscripciones: true,
        Club: true,
      },
    })

    if (!evento) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })
    }

    // 🔹 Obtener emails de jugadores
    const jugadores = await prisma.user.findMany({
      where: { id: { in: evento.inscripciones as number[] } },
      select: { email: true, firstName: true },
    })

    await prisma.evento_club.delete({ where: { id: eventoId } })

    for (const jugador of jugadores) {
      await sendgrid.send({
        to: jugador.email,
        from: process.env.SENDGRID_FROM_EMAIL as string,
        subject: "⚠️ Evento Cancelado",
        html: generarEmailHTML({
          titulo: "⚠️ Evento Cancelado",
          saludo: `Hola <strong>${jugador.firstName || "jugador"}</strong>,`,
          descripcion: `Te informamos que el evento <strong>${evento.nombre}</strong> en <strong>${evento.Club?.name || "tu club"}</strong> ha sido cancelado.`,
          detalles: [
            { label: "📆 Día", valor: formatearFechaDDMMYYYY(evento.date) },
            { label: "⏰ Hora", valor: `${evento.startTime} - ${evento.endTime}` },
            { label: "📌 Tipo", valor: evento.tipo },
          ],
          footer: `Lamentamos los inconvenientes. Esperamos verte pronto en otro evento. Gracias por utilizar JugáHora.`,
        }),
      });
      
    }

    return NextResponse.json({ message: 'Evento eliminado correctamente y jugadores notificados' })
  } catch (error) {
    console.error('Error al eliminar el evento:', error)
    return NextResponse.json({ error: 'Error al eliminar el evento' }, { status: 500 })
  }
}

/**
 * ✏️ PATCH - Editar evento y notificar cambios
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const eventoId = parseInt(params.id)

  try {
    const oldEvento = await prisma.evento_club.findUnique({
      where: { id: eventoId },
      select: {
        nombre: true,
        date: true,
        startTime: true,
        endTime: true,
        categoria: true,
        genero: true,
        tipo: true,
        formato: true,
        maxParejas: true,
        price: true,
        inscripciones: true,
        Club: true,
      },
    })

    if (!oldEvento) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })
    }

    const {
      nombre,
      date,
      startTime,
      endTime,
      categoria,
      genero,
      tipo,
      formato,
      maxParejas,
      price,
    } = await request.json()

    const updatedEvento = await prisma.evento_club.update({
      where: { id: eventoId },
      data: {
        nombre,
        date: new Date(date),
        startTime,
        endTime,
        categoria,
        genero,
        tipo,
        formato: tipo === "torneo" ? formato : null,
        maxParejas: typeof maxParejas === "string" ? parseInt(maxParejas) : maxParejas,
        price,
      },
    })

    // 🔹 Detectar cambios
    const cambios: string[] = []
    const formatDate = (d: Date | string) => new Date(d).toISOString().split("T")[0]

    if (formatDate(oldEvento.date) !== formatDate(date)) {
      cambios.push(`<strong>Fecha:</strong> ${formatDate(oldEvento.date)} ➝ ${formatDate(date)}`)
    }
    if (oldEvento.startTime !== startTime || oldEvento.endTime !== endTime) {
      cambios.push(`<strong>Hora:</strong> ${oldEvento.startTime} - ${oldEvento.endTime} ➝ ${startTime} - ${endTime}`)
    }
    if (oldEvento.categoria !== categoria) {
      cambios.push(`<strong>Categoría:</strong> ${oldEvento.categoria} ➝ ${categoria}`)
    }
    if (oldEvento.genero !== genero) {
      cambios.push(`<strong>Género:</strong> ${oldEvento.genero} ➝ ${genero}`)
    }
    if (oldEvento.tipo !== tipo) {
      cambios.push(`<strong>Tipo:</strong> ${oldEvento.tipo} ➝ ${tipo}`)
    }
    if (oldEvento.formato !== formato && tipo === "torneo") {
      cambios.push(`<strong>Formato:</strong> ${oldEvento.formato} ➝ ${formato}`)
    }
    if (oldEvento.maxParejas !== maxParejas) {
      cambios.push(`<strong>Cupo:</strong> ${oldEvento.maxParejas} ➝ ${maxParejas}`)
    }
    if (oldEvento.price !== price) {
      cambios.push(`<strong>Precio:</strong> $${oldEvento.price} ➝ $${price}`)
    }

    // 🔹 Obtener emails de los jugadores
    const jugadores = await prisma.user.findMany({
      where: { id: { in: oldEvento.inscripciones as number[] } },
      select: { email: true, firstName: true },
    })

    // 🔹 Enviar notificación
    for (const jugador of jugadores) {
      await sendgrid.send({
        to: jugador.email,
        from: process.env.SENDGRID_FROM_EMAIL as string,
        subject: "📢 Evento Actualizado",
        html: generarEmailHTML({
          titulo: "📢 Evento Modificado",
          saludo: `Hola <strong>${jugador.firstName || "jugador"}</strong>,`,
          descripcion: `El evento <strong>${oldEvento.nombre}</strong> en <strong>${oldEvento.Club?.name || "tu club"}</strong> ha sido actualizado. A continuación te detallamos los cambios realizados.`,
          detalles: [
            { label: "🔄 Cambios realizados", valor: `<ul style="text-align:left; margin: 0;">${cambios.map(c => `<li>${c}</li>`).join("")}</ul>` },
            { label: "📅 Día", valor: formatearFechaDDMMYYYY(date) },
            { label: "⏰ Hora", valor: `${startTime} - ${endTime}` },
            { label: "🎯 Categoría", valor: categoria },
            { label: "🎭 Género", valor: genero },
            { label: "📌 Tipo", valor: tipo + (tipo === "torneo" && formato ? ` - Formato ${formato}` : "") },
            { label: "👥 Cupo", valor: `${maxParejas} ${tipo === "torneo" ? "parejas" : "personas"}` },
            { label: "💰 Precio", valor: `$${price}` },
          ],
          footer: `Pedimos disculpas por el cambio. Esperamos que puedas asistir igualmente. Si no podés, podés darte de baja del evento desde la plataforma.`,
        }),
      });
      
    }

    return NextResponse.json(updatedEvento)
  } catch (error) {
    console.error('Error al actualizar el evento:', error)
    return NextResponse.json({ error: 'Error al actualizar el evento' }, { status: 500 })
  }
}
