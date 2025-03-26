"use client"

import type React from "react"

import { useState, useEffect} from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { crearMovimiento } from "@/lib/acciones-movimientos"
import { Plus } from "lucide-react"


interface AgregarMovimientoDialogProps {
  onMovimientoCreado: () => void
  clubId: number
}

export function AgregarMovimientoDialog({ onMovimientoCreado }: AgregarMovimientoDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [tipoMovimiento, setTipoMovimiento] = useState<"ingreso" | "egreso">("ingreso")
  const [clubId, setClubId] = useState<string | null>(null)



  const [formData, setFormData] = useState({
    concepto: "",
    jugador: "",
    cancha: "",
    fechaTurno: new Date().toISOString().split("T")[0],
    metodoPago: "Efectivo",
    monto: "",
  })

  // Llamada al backend para obtener la sesión y el clubId
  useEffect(() => {
    const obtenerClubId = async () => {
      try {
        const response = await fetch("/api/matches") // Suponiendo que tienes esta API configurada
        const data = await response.json()
        setClubId(data.clubId) // Ajusta según la respuesta
      } catch (error) {
        console.error("Error al obtener el clubId:", error)
      }
    }
    obtenerClubId()
  }, [])


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validación básica
    if (!formData.concepto || !formData.monto || isNaN(Number(formData.monto)) || Number(formData.monto) <= 0) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos correctamente",
        variant: "destructive",
      });
      return;
    }

    // Verificar que el clubId esté disponible
    if (!clubId) {
      toast({
        title: "Error",
        description: "No se pudo obtener el clubId.",
        variant: "destructive",
      });
      return;
    }



    try {
      setCargando(true)

      const movimientoData = {
        concepto: formData.concepto,
        jugador: formData.jugador || null,
        cancha: formData.cancha || null,
        fechaTurno: new Date(formData.fechaTurno).toISOString(),
        fechaMovimiento: new Date().toISOString(),
        metodoPago: formData.metodoPago as "Efectivo" | "Transferencia" | "Tarjeta",
        ingreso: tipoMovimiento === "ingreso" ? Number(formData.monto) : null,
        egreso: tipoMovimiento === "egreso" ? Number(formData.monto) : null,
        clubId,
      }

      const resultado = await crearMovimiento(movimientoData)

      if (resultado.success) {
        toast({
          title: "Éxito",
          description: "Movimiento registrado correctamente",
        })

        // Resetear formulario
        setFormData({
          concepto: "",
          jugador: "",
          cancha: "",
          fechaTurno: new Date().toISOString().split("T")[0],
          metodoPago: "Efectivo",
          monto: "",
        })

        // Cerrar diálogo
        setOpen(false)

        // Notificar al componente padre
        onMovimientoCreado()
      } else {
        throw new Error(resultado.error)
      }
    } catch (error) {
        console.error(error)
      toast({
        title: "Error",
        description: "No se pudo registrar el movimiento",
        variant: "destructive",
      })
    } finally {
      setCargando(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-500 hover:bg-green-600">
          <Plus className="mr-2 h-4 w-4" /> Nuevo Movimiento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Movimiento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="tipoMovimiento">Tipo de Movimiento</Label>
            <RadioGroup
              id="tipoMovimiento"
              value={tipoMovimiento}
              onValueChange={(value) => setTipoMovimiento(value as "ingreso" | "egreso")}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ingreso" id="ingreso" />
                <Label htmlFor="ingreso" className="text-green-600 font-medium">
                  Ingreso
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="egreso" id="egreso" />
                <Label htmlFor="egreso" className="text-red-600 font-medium">
                  Egreso
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="concepto">Concepto *</Label>
            <Input
              id="concepto"
              name="concepto"
              value={formData.concepto}
              onChange={handleChange}
              placeholder="Ej: Cobro de turno, Venta de producto, etc."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jugador">Jugador</Label>
              <Input
                id="jugador"
                name="jugador"
                value={formData.jugador}
                onChange={handleChange}
                placeholder="Opcional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cancha">Cancha</Label>
              <Input id="cancha" name="cancha" value={formData.cancha} onChange={handleChange} placeholder="Opcional" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaTurno">Fecha de Turno</Label>
              <Input
                id="fechaTurno"
                name="fechaTurno"
                type="date"
                value={formData.fechaTurno}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metodoPago">Método de Pago</Label>
              <Select value={formData.metodoPago} onValueChange={(value) => handleSelectChange("metodoPago", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Efectivo">Efectivo</SelectItem>
                  <SelectItem value="Transferencia">Transferencia</SelectItem>
                  <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monto">Monto *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
              <Input
                id="monto"
                name="monto"
                value={formData.monto}
                onChange={handleChange}
                className="pl-8"
                placeholder="0.00"
                type="number"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={cargando}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={cargando}
              className={
                tipoMovimiento === "ingreso" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
              }
            >
              {cargando ? "Guardando..." : "Guardar Movimiento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

