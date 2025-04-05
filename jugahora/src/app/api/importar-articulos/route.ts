import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import * as XLSX from "xlsx"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

interface ExcelRow {
  Código?: string
  Nombre?: string
  "Precio Compra"?: number | string
  "Precio Venta"?: number | string
  Tipo?: string
  "En Stock"?: string
  Activo?: string
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("archivo") as File

    if (!file) {
      return NextResponse.json({ error: "No se ha proporcionado ningún archivo" }, { status: 400 })
    }

    // ✅ Obtener token de cookie y extraer clubId
    const cookieHeader = request.headers.get("cookie") || ""
    const token = cookieHeader.split("; ").find(c => c.startsWith("token="))?.split("=")[1]

    if (!token) {
      return NextResponse.json({ error: "No autorizado: token no encontrado" }, { status: 401 })
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (err) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    if (!decoded.isClub || !decoded.id) {
      return NextResponse.json({ error: "Solo los clubes pueden importar artículos" }, { status: 403 })
    }

    const clubId = decoded.id

    // 🧠 Procesar archivo Excel
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: "array" })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(worksheet) as ExcelRow[]

    for (const row of data) {
      const articulo = {
        codigo: row["Código"] || "",
        nombre: row["Nombre"] || "",
        precioCompra: Number(row["Precio Compra"]) || 0,
        precioVenta: Number(row["Precio Venta"]) || 0,
        tipo: row["Tipo"] === "Ambos" ? "Ambos" : "Venta",
        mostrarStock: row["En Stock"] === "Sí",
        activo: row["Activo"] === "Sí",
        clubId,
      }

      const existente = await prisma.articulo.findFirst({
        where: {
          codigo: articulo.codigo,
          clubId,
        },
      })

      if (existente) {
        await prisma.articulo.update({
          where: { id: existente.id },
          data: articulo,
        })
      } else {
        await prisma.articulo.create({
          data: articulo,
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al importar:", error)
    return NextResponse.json({ error: "Error al importar los artículos" }, { status: 500 })
  }
}
