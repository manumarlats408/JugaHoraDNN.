import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("cookie")?.split("; ").find((c) => c.startsWith("token="))?.split("=")[1]

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number | string; isClub: boolean }

    if (!decoded.isClub) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const clubId = typeof decoded.id === "string" ? parseInt(decoded.id) : decoded.id

    const { searchParams } = new URL(request.url)
    const desde = searchParams.get("desde")
    const hasta = searchParams.get("hasta")

    if (!desde || !hasta) {
      return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 })
    }

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
