"use client"

import { useEffect, useState } from "react"
import type { MovimientoFinanciero } from "@/lib/tipos"
import AgregarMovimientoDialog from "./agregar-movimiento-dialog"

export default function MovimientosFinancieros() {
  const [movimientos, setMovimientos] = useState<MovimientoFinanciero[]>([])
  const [desde, setDesde] = useState("")
  const [hasta, setHasta] = useState("")

  const fetchMovimientos = async () => {
    const params = new URLSearchParams()
    if (desde) params.append("desde", desde)
    if (hasta) params.append("hasta", hasta)

    const res = await fetch(`/api/movimientos?${params.toString()}`)
    const data = await res.json()
    setMovimientos(data)
  }

  useEffect(() => {
    fetchMovimientos()
  }, [desde, hasta])

  const totalIngreso = movimientos.reduce((s, m) => s + (m.ingreso || 0), 0)
  const totalEgreso = movimientos.reduce((s, m) => s + (m.egreso || 0), 0)

  return (
    <div className="p-4 bg-white shadow rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Movimientos</h2>
        <AgregarMovimientoDialog onSuccess={fetchMovimientos} />
      </div>

      <div className="flex gap-4 mb-4">
        <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
      </div>

      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th>Fecha</th>
            <th>Concepto</th>
            <th>Jugador</th>
            <th>Ingreso</th>
            <th>Egreso</th>
            <th>Método</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.map((m) => (
            <tr key={m.id}>
              <td>{new Date(m.fechaMovimiento).toLocaleDateString()}</td>
              <td>{m.concepto}</td>
              <td>{m.jugador || "-"}</td>
              <td className="text-green-600">{m.ingreso || "-"}</td>
              <td className="text-red-600">{m.egreso || "-"}</td>
              <td>{m.metodoPago}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between mt-4 font-semibold">
        <div>Ingresos: ${totalIngreso}</div>
        <div>Egresos: ${totalEgreso}</div>
      </div>
    </div>
  )
}
