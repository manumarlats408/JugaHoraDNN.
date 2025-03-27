"use client"

import { useEffect, useState } from "react"
import { CalendarIcon, Clock, Trophy, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

type Evento = {
  id: number
  nombre: string
  date: string
  startTime: string
  endTime: string
  tipo: string
  formato?: string
  categoria?: string
  genero: string
  maxParejas: number
  parejas: string[]
  price: number
  Club: { name: string }
}

export default function UnirseEvento() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null)
  const [nombre1, setNombre1] = useState("")
  const [nombre2, setNombre2] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const fetchEventos = async () => {
      const res = await fetch("/api/eventos/usuarios", { credentials: "include" })
      const data = await res.json()
      setEventos(data)
    }

    fetchEventos()
  }, [])

  const handleUnirse = async () => {
    if (!nombre1 || !nombre2 || !eventoSeleccionado) return

    const res = await fetch(`/api/eventos/${eventoSeleccionado.id}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombrePareja1: nombre1, nombrePareja2: nombre2 }),
    })

    if (res.ok) {
      alert("Pareja registrada exitosamente")
      setNombre1("")
      setNombre2("")
      setDialogOpen(false)
    } else {
      const error = await res.json()
      alert(error.error || "Error al unirse al evento")
    }
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Unirse a un evento</h1>
      <div className="space-y-4">
        {eventos.map((evento) => (
          <div
            key={evento.id}
            className="border p-4 rounded-lg shadow-sm flex justify-between items-center hover:bg-gray-50"
          >
            <div>
              <p className="font-semibold text-lg">{evento.nombre}</p>
              <p className="text-sm text-gray-600 flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1" />
                {evento.date.split("T")[0]}
              </p>
              <p className="text-sm text-gray-600 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {evento.startTime} - {evento.endTime}
              </p>
              <p className="text-sm text-gray-600 flex items-center">
                <Trophy className="w-4 h-4 mr-1" />
                {evento.tipo === "torneo"
                  ? `Torneo - Formato: ${evento.formato}`
                  : "Cancha abierta"}
              </p>
              <p className="text-sm text-gray-600">
                🎯 Nivel {evento.categoria || "No definido"} ({evento.genero})
              </p>
              <p className="text-sm text-gray-600 flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {evento.parejas.length}/{evento.maxParejas} parejas
              </p>
              <p className="text-sm font-bold text-green-600">${evento.price}</p>
            </div>
            <Button onClick={() => { setEventoSeleccionado(evento); setDialogOpen(true); }}>
              Unirme
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inscribí tu pareja</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input placeholder="Nombre jugador 1" value={nombre1} onChange={(e) => setNombre1(e.target.value)} />
            <Input placeholder="Nombre jugador 2" value={nombre2} onChange={(e) => setNombre2(e.target.value)} />
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={handleUnirse}>Confirmar inscripción</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
