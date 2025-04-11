"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type Props = {
  onSuccess: () => void
}

export default function AgregarMovimientoDialog({ onSuccess }: Props) {
  const [open, setOpen] = useState(false)
  const [concepto, setConcepto] = useState("")
  const [fechaMovimiento, setFechaMovimiento] = useState("")
  const [ingreso, setIngreso] = useState<number | null>(null)
  const [egreso, setEgreso] = useState<number | null>(null)
  const [metodoPago, setMetodoPago] = useState("")

  const handleSubmit = async () => {
    const res = await fetch("/api/movimientos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        concepto,
        fechaMovimiento,
        ingreso,
        egreso,
        metodoPago,
      }),
    })

    const data = await res.json()

    if (res.ok) {
      setOpen(false)
      setConcepto("")
      setFechaMovimiento("")
      setIngreso(null)
      setEgreso(null)
      setMetodoPago("")
      onSuccess()
    } else {
      alert(`Error al guardar el movimiento: ${data.error || "Error desconocido"}`)
      console.error("Error al guardar movimiento:", data)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-500 hover:bg-green-600 text-white gap-2">
          <Plus className="h-4 w-4" />
          <span>Nuevo Movimiento</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo Movimiento</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="concepto">Concepto</Label>
            <Input
              id="concepto"
              placeholder="Concepto"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="fecha">Fecha</Label>
            <Input
              id="fecha"
              type="date"
              value={fechaMovimiento}
              onChange={(e) => setFechaMovimiento(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ingreso">Ingreso</Label>
            <Input
              id="ingreso"
              type="number"
              placeholder="Ingreso"
              value={ingreso ?? ""}
              onChange={(e) => setIngreso(Number(e.target.value) || null)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="egreso">Egreso</Label>
            <Input
              id="egreso"
              type="number"
              placeholder="Egreso"
              value={egreso ?? ""}
              onChange={(e) => setEgreso(Number(e.target.value) || null)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="metodoPago">Método de pago</Label>
            <select
              id="metodoPago"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
            >
              <option value="">Seleccionar método</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Tarjeta">Tarjeta</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button className="bg-green-600 hover:bg-green-700" onClick={handleSubmit}>
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
