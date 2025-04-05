"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { actualizarArticulo } from "@/lib/acciones-cliente"
import type { Articulo } from "@/lib/tipos"
import { Edit } from "lucide-react"

interface EditarStockDialogProps {
  articulo: Articulo
  onArticuloActualizado: (articulo: Articulo) => void
}

export function EditarStockDialog({ articulo, onArticuloActualizado }: EditarStockDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [cargando, setCargando] = useState(false)

  const [formData, setFormData] = useState({
    mostrarEnStock: articulo.mostrarStock,
    activo: articulo.activo,
    precioCompra: articulo.precioCompra.toString(),
    precioVenta: articulo.precioVenta.toString(),
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validación básica
    if (
      isNaN(Number(formData.precioCompra)) ||
      isNaN(Number(formData.precioVenta)) ||
      Number(formData.precioCompra) < 0 ||
      Number(formData.precioVenta) < 0
    ) {
      toast({
        title: "Error",
        description: "Los precios deben ser valores numéricos válidos",
        variant: "destructive",
      })
      return
    }

    try {
      setCargando(true)

      const articuloActualizado: Articulo = {
        ...articulo,
        mostrarStock: formData.mostrarEnStock,
        activo: formData.activo,
        precioCompra: Number(formData.precioCompra),
        precioVenta: Number(formData.precioVenta),
      }

      const resultado = await actualizarArticulo(articuloActualizado)

      if (resultado.success) {
        toast({
          title: "Éxito",
          description: "Artículo actualizado correctamente",
        })

        // Cerrar diálogo
        setOpen(false)

        // Notificar al componente padre
        onArticuloActualizado(articuloActualizado)
      } else {
        throw new Error(resultado.error)
      }
    } catch (error) {
        console.error(error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el artículo",
        variant: "destructive",
      })
    } finally {
      setCargando(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Editar Artículo: {articulo.nombre}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precioCompra">Precio de Compra</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                <Input
                  id="precioCompra"
                  name="precioCompra"
                  value={formData.precioCompra}
                  onChange={handleChange}
                  className="pl-8"
                  type="number"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="precioVenta">Precio de Venta</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                <Input
                  id="precioVenta"
                  name="precioVenta"
                  value={formData.precioVenta}
                  onChange={handleChange}
                  className="pl-8"
                  type="number"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="mostrarEnStock" className="cursor-pointer">
              Mostrar en Stock
            </Label>
            <Switch
              id="mostrarEnStock"
              checked={formData.mostrarEnStock}
              onCheckedChange={(checked) => handleSwitchChange("mostrarEnStock", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="activo" className="cursor-pointer">
              Artículo Activo
            </Label>
            <Switch
              id="activo"
              checked={formData.activo}
              onCheckedChange={(checked) => handleSwitchChange("activo", checked)}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={cargando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={cargando}>
              {cargando ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

