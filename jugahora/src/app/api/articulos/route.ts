import { NextResponse, type NextRequest } from "next/server"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

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

    const articulos = await prisma.articulo.findMany({
      where: { clubId },
      orderBy: {
        codigo: "asc",
      },
    })

    return NextResponse.json(articulos)
  } catch (error) {
    console.error("Error fetching articulos:", error)
    return NextResponse.json({ error: "Error al cargar los artículos" }, { status: 500 })
  }
}
