import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()
import * as XLSX from "xlsx"


export async function GET() {
  try {
    const articulos = await prisma.articulo.findMany({
      orderBy: {
        codigo: "asc",
      },
    })

    // Create a worksheet
    const worksheet = XLSX.utils.json_to_sheet(
      articulos.map((articulo) => ({
        Código: articulo.codigo,
        Nombre: articulo.nombre,
        "Precio Compra": articulo.precioCompra,
        "Precio Venta": articulo.precioVenta,
        Tipo: articulo.tipo,
        "Mostrar Stock": articulo.mostrarStock ? "Sí" : "No", // Cambiado a mostrarEnStock
        Activo: articulo.activo ? "Sí" : "No",
      })),
    )

    // Create a workbook
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Articulos")

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    // Return the Excel file
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=articulos.xlsx",
      },
    })
  } catch (error) {
    console.error("Error exporting articulos:", error)
    return NextResponse.json({ error: "Error al exportar los artículos" }, { status: 500 })
  }
}

