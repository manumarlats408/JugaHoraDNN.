import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const articulos = await prisma.articulo.findMany();
    return NextResponse.json(articulos)
  } catch (error) {
    console.error("Error al obtener los artículos:", error)
    return NextResponse.json({ error: "Error al obtener los artículos" }, { status: 500 })
  }
}
