"use client"

import { useState, useEffect } from "react"
import { Search, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { TablaMovimientos } from "@/components/tabla-movimientos"
import { ResumenSaldos } from "@/components/resumen-saldos"
import { AgregarMovimientoDialog } from "@/components/agregar-movimiento-dialog"
import { useToast } from "@/hooks/use-toast"
import type { Movimiento } from "@/lib/tipos"

export function MovimientosFinancieros() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [fechaDesde, setFechaDesde] = useState<string>(
    new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  )
  const [fechaHasta, setFechaHasta] = useState<string>(new Date().toISOString().split("T")[0])
  const [cargando, setCargando] = useState(true)
  const { toast } = useToast()

  const cargarMovimientos = async () => {
    try {
      setCargando(true)
      const respuesta = await fetch(`/api/movimientos?desde=${fechaDesde}&hasta=${fechaHasta}`)
      if (!respuesta.ok) throw new Error("Error al cargar los movimientos")
      const datos = await respuesta.json()
      setMovimientos(datos)
    } catch (error) {
        console.error(error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los movimientos",
        variant: "destructive",
      })
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarMovimientos()
  }, [fechaDesde, fechaHasta, toast])

  const movimientosFiltrados = movimientos.filter(
    (movimiento) =>
      movimiento.concepto.toLowerCase().includes(busqueda.toLowerCase()) ||
      (movimiento.jugador && movimiento.jugador.toLowerCase().includes(busqueda.toLowerCase())),
  )

  // Calcular totales
  const totalEfectivo = movimientosFiltrados
    .filter((m) => m.metodoPago === "Efectivo")
    .reduce((total, m) => total + (m.ingreso || 0) - (m.egreso || 0), 0)

  const totalTransferencia = movimientosFiltrados
    .filter((m) => m.metodoPago === "Transferencia")
    .reduce((total, m) => total + (m.ingreso || 0) - (m.egreso || 0), 0)

  const saldoTotal = totalEfectivo + totalTransferencia

  const handleMovimientoCreado = () => {
    cargarMovimientos()
  }

  return (
    <div className="py-6">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-medium text-gray-600">MOVIMIENTOS FINANCIEROS</h1>
          <p className="text-gray-500 mt-2">Consulta todos los movimientos financieros del complejo deportivo</p>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Buscar por concepto o jugador"
                className="pl-10"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <div className="flex flex-col md:flex-row gap-3 items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Desde</span>
                <div className="relative">
                  <Input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                    className="w-full md:w-48"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Hasta</span>
                <div className="relative">
                  <Input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                    className="w-full md:w-48"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                </div>
              </div>
              <AgregarMovimientoDialog onMovimientoCreado={handleMovimientoCreado} />
            </div>
          </div>

          <TablaMovimientos movimientos={movimientosFiltrados} cargando={cargando} />

          <ResumenSaldos
            totalEfectivo={totalEfectivo}
            totalTransferencia={totalTransferencia}
            saldoTotal={saldoTotal}
          />
        </div>
      </div>
    </div>
  )
}

