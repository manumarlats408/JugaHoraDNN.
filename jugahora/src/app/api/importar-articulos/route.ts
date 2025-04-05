import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()
import * as XLSX from "xlsx"

// Define an interface for the Excel row structure
interface ExcelRow {
  [key: string]: any
  Código?: string
  codigo?: string
  Nombre?: string
  nombre?: string
  "Precio Compra"?: number | string
  precioCompra?: number | string
  "Precio Venta"?: number | string
  precioVenta?: number | string
  Tipo?: string
  tipo?: string
  "Mostrar Stock"?: string | boolean
  mostrarEnStock?: string | boolean // Cambiado a mostrarEnStock
  Activo?: string | boolean
  activo?: string | boolean
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("archivo") as File

    if (!file) {
      return NextResponse.json({ error: "No se ha proporcionado ningún archivo" }, { status: 400 })
    }

    // Read the file
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: "array" })

    // Get the first worksheet
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]

    // Convert to JSON and cast to our ExcelRow type
    const data = XLSX.utils.sheet_to_json(worksheet) as ExcelRow[]

    // Get the current clubId (in a real app, this would come from authentication)
    // For now, we'll use a default value of 1
    const clubId = 1

    // Process and save each row
    for (const row of data) {
      const articulo = {
        codigo: row["Código"] || row["codigo"] || "",
        nombre: row["Nombre"] || row["nombre"] || "",
        precioCompra: Number.parseFloat(String(row["Precio Compra"] || row["precioCompra"] || 0)),
        precioVenta: Number.parseFloat(String(row["Precio Venta"] || row["precioVenta"] || 0)),
        tipo: row["Tipo"] || row["tipo"] || "",
        mostrarEnStock: row["Mostrar Stock"] === "Sí" || row["mostrarEnStock"] === true, // Cambiado a mostrarEnStock
        activo: row["Activo"] === "Sí" || row["activo"] === true,
        clubId,
      }

      // Check if the article already exists
      const existingArticulo = await prisma.articulo.findFirst({
        where: {
          codigo: articulo.codigo,
          clubId,
        },
      })

      if (existingArticulo) {
        // Update existing article
        await prisma.articulo.update({
          where: { id: existingArticulo.id },
          data: articulo,
        })
      } else {
        // Create new article
        await prisma.articulo.create({
          data: articulo,
        })
      }
    }

    // Return success
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error importing articulos:", error)
    return NextResponse.json({ error: "Error al importar los artículos" }, { status: 500 })
  }
}

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

