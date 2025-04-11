"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import type { Articulo } from "@/lib/tipos"

interface ModalEditarArticuloProps {
  articulo: Articulo | null
  abierto: boolean
  onClose: () => void
  onGuardado: (actualizado: Articulo) => void
}

export function ModalEditarArticulo({ articulo, abierto, onClose, onGuardado }: ModalEditarArticuloProps) {
  const [form, setForm] = useState<Articulo | null>(null)

  useEffect(() => {
    setForm(articulo)
  }, [articulo])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!form) return
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form) return

    const res = await fetch(`/api/articulos/${form.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...form,
        precioCompra: form.precioCompra?.toString() ?? '',
        precioVenta: form.precioVenta?.toString() ?? '',
        cantidadStock: form.cantidadStock?.toString() ?? '',
      })
    })

    if (res.ok) {
      const actualizado = await res.json()
      onGuardado(actualizado)
      onClose()
    } else {
      alert("Error al guardar")
    }
  }

  if (!form) return null

  return (
    <Dialog open={abierto} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar artículo</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Input name="codigo" value={form.codigo} onChange={handleChange} placeholder="Código" />
          <Input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" />
          <Input name="precioCompra" value={form.precioCompra} onChange={handleChange} placeholder="Precio Compra" />
          <Input name="precioVenta" value={form.precioVenta} onChange={handleChange} placeholder="Precio Venta" />
          <Input name="tipo" value={form.tipo} onChange={handleChange} placeholder="Tipo" />
          <Input name="cantidadStock" value={form.cantidadStock} onChange={handleChange} placeholder="Stock" />
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
