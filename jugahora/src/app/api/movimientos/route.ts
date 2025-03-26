import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    // Obtener y loguear el cuerpo de la solicitud
    const body = await request.json()
    console.log("Cuerpo de la solicitud:", body)

    const { concepto, jugador, cancha, fechaTurno, fechaMovimiento, metodoPago, egreso, ingreso, clubId } = body

    // Validación de datos
    if (!concepto || !fechaMovimiento || !metodoPago || !clubId) {
      console.log("Datos faltantes:", { concepto, fechaMovimiento, metodoPago, clubId })
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 })
    }

    // Log antes de la consulta a la base de datos
    console.log("Creando movimiento con estos datos:", {
      concepto,
      jugador,
      cancha,
      fechaTurno,
      fechaMovimiento,
      metodoPago,
      egreso,
      ingreso,
      clubId,
    })

    // Crear el movimiento
    const nuevoMovimiento = await prisma.movimientoFinanciero.create({
      data: {
        concepto,
        jugador,
        cancha,
        fechaTurno: fechaTurno ? new Date(fechaTurno) : null,
        fechaMovimiento: new Date(fechaMovimiento),
        metodoPago,
        egreso: egreso ?? 0,
        ingreso: ingreso ?? 0,
        clubId,
      },
    })

    // Log de la respuesta de la base de datos
    console.log("Movimiento creado:", nuevoMovimiento)

    return NextResponse.json(nuevoMovimiento, { status: 201 })
  } catch (error) {
    console.error("Error al crear el movimiento:", error)
    return NextResponse.json({ error: "Error al guardar el movimiento" }, { status: 500 })
  }
}
