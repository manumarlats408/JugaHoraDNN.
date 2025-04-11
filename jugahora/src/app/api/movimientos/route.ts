import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { decode } from "jsonwebtoken" // o usa jose si preferís
import { headers } from "next/headers"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const desde = searchParams.get("desde")
  const hasta = searchParams.get("hasta")

  const headersList = headers()
  const authHeader = headersList.get("authorization")

  if (!authHeader) {
    return NextResponse.json({ error: "Falta token" }, { status: 401 })
  }

  const token = authHeader.replace("Bearer ", "")
  const decoded = decode(token) as { id?: string | number }

  const clubId = typeof decoded?.id === "string" ? parseInt(decoded.id) : decoded?.id

  if (!desde || !hasta || !clubId) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 })
  }

  try {
    const movimientos = await prisma.movimientoFinanciero.findMany({
      where: {
        clubId,
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
