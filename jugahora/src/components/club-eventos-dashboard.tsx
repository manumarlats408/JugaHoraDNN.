"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Plus, Trophy, Clock, Users, Hash } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Evento = {
  id: number
  nombre: string
  date: string
  startTime: string
  endTime: string
  tipo: string
  genero: string
  categoria: string
  maxParejas: number
  formato: string
}

type Club = {
  id: number
  name: string
}

export function ClubEventosDashboard() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [clubData, setClubData] = useState<Club | null>(null)
  const [newEvento, setNewEvento] = useState<Omit<Evento, "id">>({
    nombre: "",
    date: "",
    startTime: "",
    endTime: "",
    tipo: "cancha_abierta",
    genero: "mixto",
    categoria: "",
    maxParejas: 4,
    formato: ""
  })

  const fetchClubEventos = async () => {
    const res = await fetch("/api/auth", { credentials: "include" })
    const data = await res.json()
    setClubData(data.entity)

    const eventosRes = await fetch(`/api/eventos?clubId=${data.entity.id}`, { credentials: "include" })
    const eventosData = await eventosRes.json()
    setEventos(eventosData)
  }

  useEffect(() => {
    fetchClubEventos()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewEvento(prev => ({
      ...prev,
      [name]: name === "maxParejas" ? parseInt(value) : value
    }))
  }

  const handleCreateEvento = async () => {
    if (!clubData) return
    const response = await fetch("/api/eventos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newEvento, clubId: clubData.id })
    })
    if (response.ok) {
      const created = await response.json()
      setEventos(prev => [...prev, created])
      setNewEvento({
        nombre: "",
        date: "",
        startTime: "",
        endTime: "",
        tipo: "cancha_abierta",
        genero: "mixto",
        categoria: "",
        maxParejas: 4,
        formato: ""
      })
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-[4rem] p-6 space-y-6 overflow-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Eventos del Club {clubData?.name}</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Crear Evento</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Evento</DialogTitle>
                <DialogDescription>Completá los datos para publicar tu evento</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Label>Nombre</Label>
                <Input name="nombre" value={newEvento.nombre} onChange={handleChange} />

                <Label>Fecha</Label>
                <Input type="date" name="date" value={newEvento.date} onChange={handleChange} />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Hora Inicio</Label>
                    <Input type="time" name="startTime" value={newEvento.startTime} onChange={handleChange} />
                  </div>
                  <div>
                    <Label>Hora Fin</Label>
                    <Input type="time" name="endTime" value={newEvento.endTime} onChange={handleChange} />
                  </div>
                </div>

                <Label>Categoría</Label>
                <Input name="categoria" value={newEvento.categoria} onChange={handleChange} />

                <Label>Género</Label>
                <select name="genero" value={newEvento.genero} onChange={handleChange} className="w-full border p-2 rounded">
                  <option value="mixto">Mixto</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                </select>

                <Label>Tipo</Label>
                <select name="tipo" value={newEvento.tipo} onChange={handleChange} className="w-full border p-2 rounded">
                  <option value="cancha_abierta">Cancha Abierta</option>
                  <option value="torneo">Torneo</option>
                </select>

                <Label>Max. Parejas</Label>
                <Input type="number" name="maxParejas" value={newEvento.maxParejas} onChange={handleChange} />

                {newEvento.tipo === "torneo" && (
                  <>
                    <Label>Formato</Label>
                    <select name="formato" value={newEvento.formato} onChange={handleChange} className="w-full border p-2 rounded">
                      <option value="eliminacion_directa">Eliminación Directa</option>
                      <option value="grupos">Grupos</option>
                    </select>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button onClick={handleCreateEvento}>Guardar Evento</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Eventos Programados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {eventos.map(evento => (
                <div key={evento.id} className="border p-4 rounded hover:bg-gray-50 transition">
                  <p className="font-semibold text-xl">{evento.nombre}</p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2" /> {evento.date}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Clock className="h-4 w-4 mr-2" /> {evento.startTime} - {evento.endTime}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Trophy className="h-4 w-4 mr-2" /> {evento.tipo === "torneo" ? "Torneo" : "Cancha Abierta"}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Users className="h-4 w-4 mr-2" /> Máx. {evento.maxParejas} parejas
                  </p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Hash className="h-4 w-4 mr-2" /> Categoría: {evento.categoria} - Género: {evento.genero}
                  </p>
                  {evento.tipo === "torneo" && (
                    <p className="text-sm text-gray-600">Formato: {evento.formato}</p>
                  )}
                </div>
              ))}
              {eventos.length === 0 && (
                <p className="text-center text-gray-500">No hay eventos programados</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
