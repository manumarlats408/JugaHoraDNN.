import { prisma } from "./prisma"
import type { Articulo } from "@/lib/tipos"

export async function actualizarArticuloDB(id: number, datos: Articulo) {
  return await prisma.articulo.update({
    where: { id },
    data: {
      codigo: datos.codigo,
      nombre: datos.nombre,
      precioCompra: datos.precioCompra,
      precioVenta: datos.precioVenta,
      tipo: datos.tipo,
      mostrarStock: datos.mostrarStock,
      activo: datos.activo,
      updatedAt: new Date(), // Asegurate de convertir el string a Date si lo estás manejando manualmente
      clubId: datos.clubId,
    },
  })
}

export async function crearArticulo(data: Omit<Articulo, "id">) {
    return await prisma.articulo.create({ data })
  }
  
