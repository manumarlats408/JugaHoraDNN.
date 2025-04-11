"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { formatearFecha, formatearPrecio } from "@/lib/utils"
import type { MovimientoFinanciero } from "@/lib/tipos"

interface TablaMovimientosProps {
  movimientos: MovimientoFinanciero[]
  cargando: boolean
}

export function TablaMovimientos({ movimientos, cargando }: TablaMovimientosProps) {
  // Obtener la fecha actual para resaltar movimientos del día
  const fechaActual = new Date().toISOString().split("T")[0]

  if (cargando) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="w-full h-12" />
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto mb-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Concepto</TableHead>
            <TableHead>Jugador</TableHead>
            <TableHead>Cancha</TableHead>
            <TableHead>Fecha de turno</TableHead>
            <TableHead>Fecha movimiento</TableHead>
            <TableHead>Método de pago</TableHead>
            <TableHead>Egreso</TableHead>
            <TableHead>Ingreso</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movimientos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                No se encontraron movimientos en el período seleccionado
              </TableCell>
            </TableRow>
          ) : (
            movimientos.map((movimiento) => {
              // Verificar si el movimiento es del día actual para resaltarlo
              const esFechaActual = movimiento.fechaMovimiento.startsWith(fechaActual)

              return (
                <TableRow
                  key={movimiento.id}
                  className={esFechaActual ? "bg-green-50 border-l-4 border-l-green-500" : ""}
                >
                  <TableCell className="font-medium">{movimiento.concepto}</TableCell>
                  <TableCell>{movimiento.jugador || "-"}</TableCell>
                  <TableCell>{movimiento.cancha || "-"}</TableCell>
                  <TableCell>{formatearFecha(movimiento.fechaTurno, true)}</TableCell>
                  <TableCell>{formatearFecha(movimiento.fechaMovimiento, true)}</TableCell>
                  <TableCell>{movimiento.metodoPago}</TableCell>
                  <TableCell className="text-red-500">
                    {movimiento.egreso ? formatearPrecio(movimiento.egreso) : "-"}
                  </TableCell>
                  <TableCell className="text-green-500">
                    {movimiento.ingreso ? formatearPrecio(movimiento.ingreso) : "-"}
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}

