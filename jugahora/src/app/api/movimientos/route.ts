import { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/lib/prisma"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { concepto, jugador, cancha, fechaTurno, fechaMovimiento, metodoPago, egreso, ingreso, clubId } = req.body

      if (!concepto || !fechaMovimiento || !metodoPago || !clubId) {
        return res.status(400).json({ error: "Faltan datos obligatorios" })
      }

      const nuevoMovimiento = await prisma.movimientoFinanciero.create({
        data: {
          concepto,
          jugador,
          cancha,
          fechaTurno: fechaTurno ? new Date(fechaTurno) : null,
          fechaMovimiento: new Date(fechaMovimiento),
          metodoPago,
          egreso: egreso ?? 0,
          ingreso: ingreso ?? 0,
          clubId,
        },
      })

      return res.status(201).json(nuevoMovimiento)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: "Error al guardar el movimiento" })
    }
  } else {
    return res.status(405).json({ error: "Método no permitido" })
  }
}
