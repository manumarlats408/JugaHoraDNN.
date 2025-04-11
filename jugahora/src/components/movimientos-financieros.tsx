"use client"

import { useEffect, useState } from "react"
import { Search, Plus, Calendar } from "lucide-react"
import type { MovimientoFinanciero } from "@/lib/tipos"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function MovimientosFinancieros() {
  const [movimientos, setMovimientos] = useState<MovimientoFinanciero[]>([])
  const [desde, setDesde] = useState("")
  const [hasta, setHasta] = useState("")
  const [busqueda, setBusqueda] = useState("")

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

  const totalEfectivo = movimientos
    .filter((m) => m.metodoPago === "Efectivo")
    .reduce((s, m) => s + ((m.ingreso || 0) - (m.egreso || 0)), 0)

  const totalTransferencia = movimientos
    .filter((m) => m.metodoPago === "Transferencia")
    .reduce((s, m) => s + ((m.ingreso || 0) - (m.egreso || 0)), 0)

  const saldoTotal = totalEfectivo + totalTransferencia

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="space-y-2 mb-8">
        <h1 className="text-2xl font-medium text-gray-700">MOVIMIENTOS FINANCIEROS</h1>
        <p className="text-gray-500">Consulta todos los movimientos financieros del complejo deportivo</p>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              className="pl-10 bg-white"
              placeholder="Buscar por concepto o jugador"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 whitespace-nowrap">Desde</span>
              <div className="relative">
                <Input
                  type="date"
                  value={desde}
                  onChange={(e) => setDesde(e.target.value)}
                  className="pr-10 bg-white"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-500 whitespace-nowrap">Hasta</span>
              <div className="relative">
                <Input
                  type="date"
                  value={hasta}
                  onChange={(e) => setHasta(e.target.value)}
                  className="pr-10 bg-white"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </div>

            <Button className="bg-green-500 hover:bg-green-600 text-white gap-2">
              <Plus className="h-4 w-4" />
              <span>Nuevo Movimiento</span>
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 text-left font-medium text-gray-500">Concepto</th>
                <th className="py-3 text-left font-medium text-gray-500">Jugador</th>
                <th className="py-3 text-left font-medium text-gray-500">Cancha</th>
                <th className="py-3 text-left font-medium text-gray-500">Fecha de turno</th>
                <th className="py-3 text-left font-medium text-gray-500">Fecha movimiento</th>
                <th className="py-3 text-left font-medium text-gray-500">Método de pago</th>
                <th className="py-3 text-left font-medium text-gray-500">Egreso</th>
                <th className="py-3 text-left font-medium text-gray-500">Ingreso</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.length > 0 ? (
                movimientos.map((m) => (
                  <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3">{m.concepto}</td>
                    <td className="py-3">{m.jugador || "-"}</td>
                    <td className="py-3">{m.cancha || "-"}</td>
                    <td className="py-3">{m.fechaTurno ? new Date(m.fechaTurno).toLocaleDateString() : "-"}</td>
                    <td className="py-3">{new Date(m.fechaMovimiento).toLocaleDateString()}</td>
                    <td className="py-3">{m.metodoPago}</td>
                    <td className="py-3 text-red-600">{m.egreso ? `$${m.egreso.toFixed(2)}` : "-"}</td>
                    <td className="py-3 text-green-600">{m.ingreso ? `$${m.ingreso.toFixed(2)}` : "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500 bg-gray-50">
                    No se encontraron movimientos en el período seleccionado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="text-gray-500 mb-1">Efectivo</div>
            <div className="text-2xl font-semibold">$ {totalEfectivo.toFixed(2)}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="text-gray-500 mb-1">Transferencia</div>
            <div className="text-2xl font-semibold">$ {totalTransferencia.toFixed(2)}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="text-gray-500 mb-1">Saldo</div>
            <div className="text-2xl font-semibold">$ {saldoTotal.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
