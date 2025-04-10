// src/app/api/movimientos/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const desde = searchParams.get("desde")
  const hasta = searchParams.get("hasta")
  const clubId = searchParams.get("clubId")

  if (!desde || !hasta || !clubId) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 })
  }

  try {
    const movimientos = await prisma.movimientoFinanciero.findMany({
      where: {
        clubId: Number(clubId),
        fechaMovimiento: {
          gte: new Date(desde),
          lte: new Date(hasta + "T23:59:59"),
        },
      },
      orderBy: {
        fechaMovimiento: "desc",
      },
    })

    return NextResponse.json(movimientos)
  } catch (error) {
    console.error("Error al obtener movimientos", error)
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      concepto,
      jugador,
      cancha,
      fechaTurno,
      fechaMovimiento,
      metodoPago,
      ingreso,
      egreso,
      clubId,
    } = body

    if (!concepto || !fechaMovimiento || !metodoPago || !clubId) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    const nuevoMovimiento = await prisma.movimientoFinanciero.create({
      data: {
        concepto,
        jugador,
        cancha,
        fechaTurno: fechaTurno ? new Date(fechaTurno) : null,
        fechaMovimiento: new Date(fechaMovimiento),
        metodoPago,
        ingreso,
        egreso,
        clubId: Number(clubId),
      },
    })

    return NextResponse.json(nuevoMovimiento, { status: 201 })
  } catch (error) {
    console.error("Error al crear movimiento", error)
    return NextResponse.json({ error: "Error al crear movimiento" }, { status: 500 })
  }
}
