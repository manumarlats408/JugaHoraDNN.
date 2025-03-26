// src/app/api/movimientos/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { concepto, jugador, cancha, fechaTurno, fechaMovimiento, metodoPago, egreso, ingreso, clubId } = body

    // Validación de datos
    if (!concepto || !fechaMovimiento || !metodoPago || !clubId) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 })
    }

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

    return NextResponse.json(nuevoMovimiento, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al guardar el movimiento" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    // Ejemplo de cómo podrías consultar los movimientos
    const movimientos = await prisma.movimientoFinanciero.findMany()
    return NextResponse.json(movimientos)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al obtener los movimientos" }, { status: 500 })
  }
}
