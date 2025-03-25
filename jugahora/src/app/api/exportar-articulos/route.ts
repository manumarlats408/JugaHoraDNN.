import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import * as XLSX from "xlsx"

export async function GET() {
  try {
    const articulos = await prisma.articulo.findMany()

    const datos = articulos.map((articulo) => ({
      Codigo: articulo.codigo,
      Nombre: articulo.nombre,
      PrecioCompra: articulo.precioCompra,
      PrecioVenta: articulo.precioVenta,
      Tipo: articulo.tipo,
      MostrarStock: articulo.mostrarStock ? "Sí" : "No",
      Activo: articulo.activo ? "Sí" : "No",
    }))

    const worksheet = XLSX.utils.json_to_sheet(datos)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Artículos")

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    return new NextResponse(buffer, {
      headers: {
        "Content-Disposition": 'attachment; filename="articulos.xlsx"',
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    })
  } catch (error) {
    console.error("Error al exportar artículos:", error)
    return NextResponse.json({ error: "Error al exportar artículos" }, { status: 500 })
  }
}
