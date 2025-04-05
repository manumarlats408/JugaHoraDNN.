import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export async function GET() {
  try {
    const articulos = await prisma.articulo.findMany({
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

