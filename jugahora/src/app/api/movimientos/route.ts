// src/app/api/movimientos/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json() // Obtener el cuerpo de la solicitud
    const { concepto, jugador, cancha, fechaTurno, fechaMovimiento, metodoPago, egreso, ingreso, clubId } = body

    // Validación de datos
    if (!concepto || !fechaMovimiento || !metodoPago || !clubId) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 })
    }

    // Verificar que el clubId exista y sea válido (asegúrate de que el club exista)
    const clubExistente = await prisma.club.findUnique({
      where: { id: clubId },
    })

    if (!clubExistente) {
      return NextResponse.json({ error: "El club no existe" }, { status: 404 })
    }

    // Crear el movimiento financiero
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
        clubId, // Asociar el movimiento al clubId
      },
    })

    return NextResponse.json(nuevoMovimiento, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al guardar el movimiento" }, { status: 500 })
  }
}
