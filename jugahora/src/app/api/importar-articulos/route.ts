import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import * as XLSX from "xlsx"

interface Articulo {
  Codigo: string;
  Nombre: string;
  PrecioCompra: string;
  PrecioVenta: string;
  Tipo: string;
  MostrarStock: string;
  Activo: string;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("archivo") as Blob

    if (!file) {
      return NextResponse.json({ error: "No se subió ningún archivo" }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: "buffer" })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    
    // Convertimos la hoja en un arreglo de objetos con la estructura definida
    const datos: Articulo[] = XLSX.utils.sheet_to_json(sheet)

    // Mapeamos los datos para prepararlos para la base de datos
    const nuevosArticulos = datos.map((articulo) => {
      // Validamos los valores antes de asignarlos
      const precioCompra = parseFloat(articulo.PrecioCompra)
      const precioVenta = parseFloat(articulo.PrecioVenta)

      // Validación básica para evitar NaN
      if (isNaN(precioCompra) || isNaN(precioVenta)) {
        throw new Error(`Precio inválido para el artículo ${articulo.Nombre}`)
      }

      return {
        codigo: articulo.Codigo,
        nombre: articulo.Nombre,
        precioCompra,
        precioVenta,
        tipo: articulo.Tipo,
        mostrarStock: articulo.MostrarStock === "Sí",
        activo: articulo.Activo === "Sí",
        clubId: 1,
      }
    })

    // Insertamos los nuevos artículos en la base de datos
    await prisma.articulo.createMany({
      data: nuevosArticulos,
      skipDuplicates: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al importar artículos:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error al importar artículos" }, { status: 500 })
  }
}
