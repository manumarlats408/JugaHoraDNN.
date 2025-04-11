import { prisma } from "@/lib/prisma"
import type { MovimientoFinanciero } from "@prisma/client"

// Obtener movimientos financieros entre fechas
export async function obtenerMovimientosFinancieros(desde?: string, hasta?: string): Promise<MovimientoFinanciero[]> {
  const where: any = {}

  if (desde) {
    where.fechaMovimiento = { gte: new Date(desde) }
  }

  if (hasta) {
    where.fechaMovimiento = {
      ...where.fechaMovimiento,
      lte: new Date(hasta),
    }
  }

  return prisma.movimientoFinanciero.findMany({
    where,
    orderBy: { fechaMovimiento: "desc" },
  })
}

// Crear un nuevo movimiento financiero
export async function crearMovimientoFinanciero(
  data: Omit<MovimientoFinanciero, "id">
): Promise<MovimientoFinanciero> {
  return prisma.movimientoFinanciero.create({
    data,
  })
}
