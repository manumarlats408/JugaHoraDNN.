"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { EditarStockDialog } from "@/components/editar-stock-dialog"
import { formatearFecha, formatearPrecio } from "@/lib/utils"
import { actualizarArticulo } from "@/lib/acciones"
import { useToast } from "@/hooks/use-toast"
import type { Articulo } from "@/lib/tipos"

interface TablaArticulosProps {
  articulos: Articulo[]
  cargando: boolean
  onActualizar: (articulos: Articulo[]) => void
}

export function TablaArticulos({ articulos, cargando, onActualizar }: TablaArticulosProps) {
  const { toast } = useToast()
  const [actualizando, setActualizando] = useState<string | null>(null)

  const handleCambioActivo = async (articulo: Articulo, valor: boolean) => {
    try {
      setActualizando(articulo.id)
      const articuloActualizado = { ...articulo, activo: valor }

      const resultado = await actualizarArticulo(articuloActualizado)

      if (resultado.success) {
        // Actualizar la lista local
        const nuevosArticulos = articulos.map((a) => (a.id === articulo.id ? { ...a, activo: valor } : a))
        onActualizar(nuevosArticulos)

        toast({
          title: "Éxito",
          description: "Artículo actualizado correctamente",
        })
      } else {
        throw new Error(resultado.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el artículo",
        variant: "destructive",
      })
    } finally {
      setActualizando(null)
    }
  }

  const handleCambioStock = async (articulo: Articulo, valor: boolean) => {
    try {
      setActualizando(articulo.id)
      const articuloActualizado = { ...articulo, mostrarEnStock: valor }

      const resultado = await actualizarArticulo(articuloActualizado)

      if (resultado.success) {
        // Actualizar la lista local
        const nuevosArticulos = articulos.map((a) => (a.id === articulo.id ? { ...a, mostrarEnStock: valor } : a))
        onActualizar(nuevosArticulos)

        toast({
          title: "Éxito",
          description: "Artículo actualizado correctamente",
        })
      } else {
        throw new Error(resultado.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el artículo",
        variant: "destructive",
      })
    } finally {
      setActualizando(null)
    }
  }

  const handleArticuloActualizado = (articuloActualizado: Articulo) => {
    // Actualizar la lista local
    const nuevosArticulos = articulos.map((a) => (a.id === articuloActualizado.id ? articuloActualizado : a))
    onActualizar(nuevosArticulos)
  }

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
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Código</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Precio compra</TableHead>
            <TableHead>Precio venta</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Mostrar en stock</TableHead>
            <TableHead>Activo</TableHead>
            <TableHead>Últ. modificación</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articulos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-6 text-gray-500">
                No se encontraron artículos
              </TableCell>
            </TableRow>
          ) : (
            articulos.map((articulo) => (
              <TableRow key={articulo.id}>
                <TableCell className="font-medium">{articulo.codigo}</TableCell>
                <TableCell>{articulo.nombre}</TableCell>
                <TableCell>{formatearPrecio(articulo.precioCompra)}</TableCell>
                <TableCell>{formatearPrecio(articulo.precioVenta)}</TableCell>
                <TableCell>{articulo.tipo}</TableCell>
                <TableCell>
                  <Switch
                    checked={articulo.mostrarEnStock}
                    disabled={actualizando === articulo.id}
                    onCheckedChange={(valor) => handleCambioStock(articulo, valor)}
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={articulo.activo}
                    disabled={actualizando === articulo.id}
                    onCheckedChange={(valor) => handleCambioActivo(articulo, valor)}
                  />
                </TableCell>
                <TableCell>{formatearFecha(articulo.ultimaModificacion)}</TableCell>
                <TableCell className="text-right">
                  <EditarStockDialog articulo={articulo} onArticuloActualizado={handleArticuloActualizado} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

