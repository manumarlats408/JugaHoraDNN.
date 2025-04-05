import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()
import * as XLSX from "xlsx"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const clubId = Number(searchParams.get("clubId"))

    if (!clubId) {
      return NextResponse.json({ error: "Falta el parámetro clubId" }, { status: 400 })
    }

    const articulos = await prisma.articulo.findMany({
      where: {
        clubId: clubId,
      },
      orderBy: {
        codigo: "asc",
      },
    })

    const worksheet = XLSX.utils.json_to_sheet(
      articulos.map((articulo) => ({
        Código: articulo.codigo,
        Nombre: articulo.nombre,
        "Precio Compra": articulo.precioCompra,
        "Precio Venta": articulo.precioVenta,
        Tipo: articulo.tipo,
        "Mostrar Stock": articulo.mostrarStock ? "Sí" : "No",
        Activo: articulo.activo ? "Sí" : "No",
      }))
    )

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Articulos")

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=articulos.xlsx",
      },
    })
  } catch (error) {
    console.error("Error al exportar artículos:", error)
    return NextResponse.json({ error: "Error al exportar los artículos" }, { status: 500 })
  }
}
