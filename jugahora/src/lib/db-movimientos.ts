// Simulación de base de datos para movimientos financieros
import type { Movimiento } from "@/lib/tipos"

// Datos de ejemplo basados en la imagen
const movimientosData: Movimiento[] = [
  {
    id: "1",
    concepto: "Pre-Com - Premio Comp",
    jugador: null,
    cancha: null,
    fechaTurno: "2023-02-27T07:43:48Z",
    fechaMovimiento: "2023-02-27T07:44:05Z",
    metodoPago: "Transferencia",
    egreso: null,
    ingreso: 75000.0,
  },
  {
    id: "2",
    concepto: "Fan-2 - Fanta 2.0",
    jugador: null,
    cancha: null,
    fechaTurno: "2023-02-26T15:19:43Z",
    fechaMovimiento: "2023-02-26T15:20:05Z",
    metodoPago: "Efectivo",
    egreso: 2500.0,
    ingreso: null,
  },
  {
    id: "3",
    concepto: "Fan-2 - Fanta 2.0",
    jugador: null,
    cancha: null,
    fechaTurno: "2023-02-26T15:06:42Z",
    fechaMovimiento: "2023-02-26T15:06:51Z",
    metodoPago: "Efectivo",
    egreso: null,
    ingreso: 300.0,
  },
  {
    id: "4",
    concepto: "Cobro de turno",
    jugador: "Axel",
    cancha: "Cancha 4 F8",
    fechaTurno: "2023-02-26T11:00:00Z",
    fechaMovimiento: "2023-02-26T11:00:00Z",
    metodoPago: "Efectivo",
    egreso: null,
    ingreso: 4000.0,
  },
  {
    id: "5",
    concepto: "Coc-15 - Coca Cola 1.5",
    jugador: "Axel",
    cancha: "Cancha 4 F8",
    fechaTurno: "2023-02-26T11:00:00Z",
    fechaMovimiento: "2023-02-26T14:26:31Z",
    metodoPago: "Efectivo",
    egreso: null,
    ingreso: 500.0,
  },
  {
    id: "6",
    concepto: "Cobro de turno",
    jugador: "Pebi",
    cancha: "Cancha 1 F5",
    fechaTurno: "2023-02-26T10:30:00Z",
    fechaMovimiento: "2023-02-26T10:30:00Z",
    metodoPago: "Efectivo",
    egreso: null,
    ingreso: 3500.0,
  },
  {
    id: "7",
    concepto: "Cobro de Seña",
    jugador: "Pebi",
    cancha: "Cancha 1 F5",
    fechaTurno: "2023-02-26T10:30:00Z",
    fechaMovimiento: "2023-02-26T14:14:18Z",
    metodoPago: "Efectivo",
    egreso: null,
    ingreso: 500.0,
  },
]

export async function obtenerMovimientos(desde: string, hasta: string): Promise<Movimiento[]> {
  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Filtrar por fechas si se proporcionan
  let movimientosFiltrados = [...movimientosData]

  if (desde) {
    const fechaDesde = new Date(desde)
    fechaDesde.setHours(0, 0, 0, 0)
    movimientosFiltrados = movimientosFiltrados.filter((m) => new Date(m.fechaMovimiento) >= fechaDesde)
  }

  if (hasta) {
    const fechaHasta = new Date(hasta)
    fechaHasta.setHours(23, 59, 59, 999)
    movimientosFiltrados = movimientosFiltrados.filter((m) => new Date(m.fechaMovimiento) <= fechaHasta)
  }

  // Ordenar por fecha de movimiento (más reciente primero)
  return movimientosFiltrados.sort(
    (a, b) => new Date(b.fechaMovimiento).getTime() - new Date(a.fechaMovimiento).getTime(),
  )
}

export async function crearMovimiento(datos: Omit<Movimiento, "id">): Promise<Movimiento> {
  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 500))

  const nuevoMovimiento: Movimiento = {
    id: Math.random().toString(36).substring(2, 9), // Generar ID aleatorio
    ...datos,
  }

  // En un entorno real, aquí guardaríamos en la base de datos
  movimientosData.push(nuevoMovimiento)

  return nuevoMovimiento
}

