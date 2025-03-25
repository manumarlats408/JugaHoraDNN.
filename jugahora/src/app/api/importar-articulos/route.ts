import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import * as XLSX from "xlsx"

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
    const datos: any[] = XLSX.utils.sheet_to_json(sheet)

    const nuevosArticulos = datos.map((articulo) => ({
      codigo: articulo.Codigo,
      nombre: articulo.Nombre,
      precioCompra: parseFloat(articulo.PrecioCompra),
      precioVenta: parseFloat(articulo.PrecioVenta),
      tipo: articulo.Tipo,
      mostrarStock: articulo.MostrarStock === "Sí",
      activo: articulo.Activo === "Sí",
      clubId: 1,
    }))

    await prisma.articulo.createMany({
      data: nuevosArticulos,
      skipDuplicates: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al importar artículos:", error)
    return NextResponse.json({ error: "Error al importar artículos" }, { status: 500 })
  }
}
