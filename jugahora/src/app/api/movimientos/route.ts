// src/app/api/movimientos/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"


// GET: /api/movimientos?clubId=1&desde=2024-01-01&hasta=2024-12-31
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const clubId = Number(searchParams.get("clubId"))
  const desde = searchParams.get("desde")
  const hasta = searchParams.get("hasta")

  if (!clubId) return NextResponse.json({ error: "clubId es obligatorio" }, { status: 400 })

  const where: any = { clubId }

  if (desde) where.fechaMovimiento = { gte: new Date(desde) }
  if (hasta) {
    where.fechaMovimiento = {
      ...where.fechaMovimiento,
      lte: new Date(hasta),
    }
  }

  const movimientos = await prisma.movimientoFinanciero.findMany({
    where,
    orderBy: { fechaMovimiento: "desc" },
  })

  return NextResponse.json(movimientos)
}

// POST: /api/movimientos
export async function POST(request: Request) {
  const data = await request.json()

  if (!data.concepto || !data.fechaMovimiento || !data.metodoPago || !data.clubId) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
  }

  const nuevoMovimiento = await prisma.movimientoFinanciero.create({
    data: {
      concepto: data.concepto,
      jugador: data.jugador || null,
      cancha: data.cancha || null,
      fechaTurno: data.fechaTurno ? new Date(data.fechaTurno) : null,
      fechaMovimiento: new Date(data.fechaMovimiento),
      metodoPago: data.metodoPago,
      egreso: data.egreso ?? null,
      ingreso: data.ingreso ?? null,
      clubId: data.clubId,
    },
  })

  return NextResponse.json(nuevoMovimiento)
}
