export interface Articulo {
    id: string
    codigo: string
    nombre: string
    precioCompra: number
    precioVenta: number
    tipo: "Compra" | "Venta" | "Ambos"
    mostrarEnStock: boolean
    activo: boolean
    ultimaModificacion: string
  }
  export interface Partido {
    id: string
    court: string
    date: string
    startTime: string
    price: number
  }
  
  export interface Movimiento {
    id: string
    concepto: string
    jugador: string | null
    cancha: string | null
    fechaTurno: string
    fechaMovimiento: string
    metodoPago: "Efectivo" | "Transferencia" | "Tarjeta"
    egreso: number | null
    ingreso: number | null
  }
  
  export interface Club {
    id: string
    name: string
  }
  
  
  