"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Trash } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import type { Articulo } from "@/lib/tipos"

interface TablaArticulosProps {
  articulos: Articulo[]
  cargando: boolean
  onActualizar: (articulos: Articulo[]) => void
}

export function TablaArticulos({ articulos, cargando, onActualizar }: TablaArticulosProps) {
  const { toast } = useToast()
  const [actualizando, setActualizando] = useState<number | null>(null)

  const handleToggleActivo = async (id: number, activo: boolean) => {
    try {
      setActualizando(id)
      const response = await fetch(`/api/articulos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ activo: !activo }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar el artículo")
      }

      // Update the local state
      const articulosActualizados = articulos.map((articulo) =>
        articulo.id === id ? { ...articulo, activo: !activo } : articulo,
      )

      onActualizar(articulosActualizados)

      toast({
        title: "Éxito",
        description: `Artículo ${!activo ? "activado" : "desactivado"} correctamente`,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el artículo",
        variant: "destructive",
      })
    } finally {
      setActualizando(null)
    }
  }

  if (cargando) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (articulos.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No se encontraron artículos</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead className="text-right">Precio Compra</TableHead>
            <TableHead className="text-right">Precio Venta</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Mostrar Stock</TableHead>
            <TableHead>Activo</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articulos.map((articulo) => (
            <TableRow key={articulo.id}>
              <TableCell className="font-medium">{articulo.codigo}</TableCell>
              <TableCell>{articulo.nombre}</TableCell>
              <TableCell className="text-right">${articulo.precioCompra.toFixed(2)}</TableCell>
              <TableCell className="text-right">${articulo.precioVenta.toFixed(2)}</TableCell>
              <TableCell>{articulo.tipo}</TableCell>
              <TableCell>{articulo.mostrarStock ? "Sí" : "No"}</TableCell>
              <TableCell>
                <Switch
                  checked={articulo.activo}
                  disabled={actualizando === articulo.id}
                  onCheckedChange={() => handleToggleActivo(articulo.id, articulo.activo)}
                />
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Abrir menú</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="cursor-pointer">
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Editar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer text-red-600">
                      <Trash className="mr-2 h-4 w-4" />
                      <span>Eliminar</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

