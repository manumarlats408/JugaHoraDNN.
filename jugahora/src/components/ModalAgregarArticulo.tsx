"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface Props {
  abierto: boolean
  onClose: () => void
  onGuardado: (nuevoArticulo: any) => void
}

export function ModalAgregarArticulo({ abierto, onClose, onGuardado }: Props) {
  const { toast } = useToast()

  const [codigo, setCodigo] = useState("")
  const [nombre, setNombre] = useState("")
  const [precio, setPrecio] = useState("")

  const [cargando, setCargando] = useState(false)

  const handleGuardar = async () => {
    if (!codigo || !nombre || !precio) {
      toast({
        title: "Campos requeridos",
        description: "Completá todos los campos",
        variant: "destructive",
      })
      return
    }

    try {
      setCargando(true)

      const respuesta = await fetch("/api/articulos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo, nombre, precio: parseFloat(precio) }),
        credentials: "include",
      })

      if (!respuesta.ok) throw new Error("Error al guardar el artículo")

      const nuevo = await respuesta.json()
      onGuardado(nuevo)
      toast({ title: "Artículo creado", description: "Se agregó el nuevo artículo" })
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "No se pudo crear el artículo",
        variant: "destructive",
      })
    } finally {
      setCargando(false)
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar nuevo artículo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Código"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />
          <Input
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <Input
            placeholder="Precio"
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
          />
        </div>

        <div className="flex justify-end mt-4 gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleGuardar} disabled={cargando}>
            {cargando ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
