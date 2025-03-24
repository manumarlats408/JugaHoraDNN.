// Simulación de base de datos con datos en memoria
// En un entorno real, esto se conectaría a una base de datos como PostgreSQL, MongoDB, etc.

import type { Articulo } from "@/lib/tipos"

// Datos de ejemplo basados en la imagen
const articulos: Articulo[] = [
  {
    id: "1",
    codigo: "123",
    nombre: "Coca Colas",
    precioCompra: 50.0,
    precioVenta: 100.0,
    tipo: "Ambos",
    mostrarEnStock: true,
    activo: true,
    ultimaModificacion: "2023-02-03T12:27:00Z",
  },
  {
    id: "2",
    codigo: "456",
    nombre: "Pepsi 1lt",
    precioCompra: 100.0,
    precioVenta: 180.0,
    tipo: "Compra",
    mostrarEnStock: false,
    activo: true,
    ultimaModificacion: "2023-01-16T11:55:00Z",
  },
  {
    id: "3",
    codigo: "12345678",
    nombre: "Otro producto",
    precioCompra: 20.0,
    precioVenta: 0,
    tipo: "Ambos",
    mostrarEnStock: true,
    activo: false,
    ultimaModificacion: "2023-01-15T12:37:00Z",
  },
  {
    id: "4",
    codigo: "ab2",
    nombre: "Cerveza Lata",
    precioCompra: 200.0,
    precioVenta: 400.0,
    tipo: "Ambos",
    mostrarEnStock: true,
    activo: false,
    ultimaModificacion: "2023-01-16T09:54:00Z",
  },
  {
    id: "5",
    codigo: "111",
    nombre: "Alfajor Guaymallen",
    precioCompra: 100.0,
    precioVenta: 200.0,
    tipo: "Ambos",
    mostrarEnStock: false,
    activo: false,
    ultimaModificacion: "2023-01-16T11:55:00Z",
  },
  {
    id: "6",
    codigo: "222",
    nombre: "Agua Saborizada",
    precioCompra: 150.0,
    precioVenta: 350.0,
    tipo: "Venta",
    mostrarEnStock: true,
    activo: true,
    ultimaModificacion: "2023-01-18T12:52:00Z",
  },
  {
    id: "7",
    codigo: "Coc-15",
    nombre: "Coca Cola 1.5",
    precioCompra: 20.0,
    precioVenta: 50.0,
    tipo: "Ambos",
    mostrarEnStock: true,
    activo: true,
    ultimaModificacion: "2023-01-26T16:15:00Z",
  },
]

export async function obtenerArticulos(): Promise<Articulo[]> {
  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 500))
  return [...articulos]
}

export async function obtenerArticuloPorId(id: string): Promise<Articulo | null> {
  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 300))
  const articulo = articulos.find((a) => a.id === id)
  return articulo || null
}

export async function actualizarArticulo(id: string, datos: Partial<Articulo>): Promise<Articulo> {
  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 500))

  const indice = articulos.findIndex((a) => a.id === id)

  if (indice === -1) {
    throw new Error("Artículo no encontrado")
  }

  // Actualizar fecha de modificación
  const articuloActualizado = {
    ...articulos[indice],
    ...datos,
    ultimaModificacion: new Date().toISOString(),
  }

  articulos[indice] = articuloActualizado

  return articuloActualizado
}

export async function crearArticulo(datos: Omit<Articulo, "id" | "ultimaModificacion">): Promise<Articulo> {
  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 500))

  const nuevoArticulo: Articulo = {
    id: Math.random().toString(36).substring(2, 9), // Generar ID aleatorio
    ...datos,
    ultimaModificacion: new Date().toISOString(),
  }

  articulos.push(nuevoArticulo)

  return nuevoArticulo
}

export async function eliminarArticulo(id: string): Promise<void> {
  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 500))

  const indice = articulos.findIndex((a) => a.id === id)

  if (indice === -1) {
    throw new Error("Artículo no encontrado")
  }

  articulos.splice(indice, 1)
}

