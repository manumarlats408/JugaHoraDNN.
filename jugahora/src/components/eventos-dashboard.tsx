"use client"

import { useEffect, useState, useCallback, ChangeEvent } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Clock, Edit, Hash, Trash2, Users } from "lucide-react"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface Evento {
  id: number
  nombre: string
  date: string
  startTime: string
  endTime: string
  categoria: string
  genero: string
  tipo: string
  formato: string
  maxParejas: number
}

interface Club {
  id: string
  name: string
}

export function EventosDashboard() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [filteredEventos, setFilteredEventos] = useState<Evento[]>([])
  const [clubData, setClubData] = useState<Club | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [newEvento, setNewEvento] = useState({
    nombre: "",
    date: "",
    startTime: "",
    endTime: "",
    categoria: "",
    genero: "mixto",
    tipo: "cancha_abierta",
    formato: "",
    maxParejas: 4,
  })

  const fetchEventos = useCallback(async () => {
    if (!clubData) return
    const res = await fetch(`/api/eventos?clubId=${clubData.id}`)
    const data = await res.json()
    setEventos(data)
    setFilteredEventos(data)
  }, [clubData])

  useEffect(() => {
    fetch("/api/auth", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setClubData(data.entity))
  }, [])

  useEffect(() => {
    if (clubData) fetchEventos()
  }, [clubData, fetchEventos])

  useEffect(() => {
    if (!selectedDate) {
      setFilteredEventos(eventos)
    } else {
      const selected = selectedDate.toISOString().split("T")[0]
      setFilteredEventos(eventos.filter((e) => e.date === selected))
    }
  }, [selectedDate, eventos])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewEvento((prev) => ({
      ...prev,
      [name]: name === "maxParejas" ? parseInt(value) : value,
    }))
  }

  const handleCrearEvento = async () => {
    if (!clubData) return
    const res = await fetch("/api/eventos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newEvento, clubId: clubData.id }),
    })

    if (res.ok) {
      const creado = await res.json()
      setEventos([...eventos, creado])
      setNewEvento({
        nombre: "",
        date: "",
        startTime: "",
        endTime: "",
        categoria: "",
        genero: "mixto",
        tipo: "cancha_abierta",
        formato: "",
        maxParejas: 4,
      })
    }
  }

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const match = eventos.find((e) => new Date(e.date).toDateString() === date.toDateString())
      return match ? "bg-blue-200" : undefined
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
              <Button>+ Crear Evento</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Nuevo Evento</DialogTitle>
                <DialogDescription>Complete los detalles del evento</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input name="nombre" placeholder="Nombre del evento" onChange={handleInputChange} />
                <Input type="date" name="date" onChange={handleInputChange} />
                <Input type="time" name="startTime" placeholder="Inicio" onChange={handleInputChange} />
                <Input type="time" name="endTime" placeholder="Fin" onChange={handleInputChange} />
                <Input name="categoria" placeholder="Categoría" onChange={handleInputChange} />
                <select name="genero" onChange={handleInputChange} className="border rounded p-2">
                  <option value="mixto">Mixto</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                </select>
                <select name="tipo" onChange={handleInputChange} className="border rounded p-2">
                  <option value="cancha_abierta">Cancha Abierta</option>
                  <option value="torneo">Torneo</option>
                </select>
                {newEvento.tipo === "torneo" && (
                  <select name="formato" onChange={handleInputChange} className="border rounded p-2">
                    <option value="eliminacion_directa">Eliminación Directa</option>
                    <option value="grupos">Grupos</option>
                  </select>
                )}
                <Input type="number" name="maxParejas" placeholder="Parejas" onChange={handleInputChange} />
              </div>
              <DialogFooter>
                <Button onClick={handleCrearEvento}>Guardar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Calendario de Eventos</CardTitle>
              <CardDescription>Vista mensual</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar value={selectedDate || new Date()} onChange={(d) => setSelectedDate(d as Date)} tileClassName={tileClassName} />
              <Button onClick={() => setSelectedDate(null)} className="mt-4">
                Ver Todos
              </Button>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Eventos Programados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEventos.length > 0 ? (
                  filteredEventos.map((evento) => (
                    <div
                      key={evento.id}
                      className="flex items-center justify-between p-4 border border-blue-100 rounded-lg hover:bg-blue-50 transition-colors duration-300"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">{evento.nombre}</p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-1" /> {new Date(evento.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Clock className="w-4 h-4 mr-1" /> {evento.startTime} - {evento.endTime}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Hash className="w-4 h-4 mr-1" /> Categoría: {evento.categoria}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Users className="w-4 h-4 mr-1" /> {evento.maxParejas} parejas - {evento.genero}
                        </p>
                        <p className="text-sm text-gray-500">
                          Tipo: {evento.tipo} {evento.tipo === "torneo" && `- Formato: ${evento.formato}`}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500">No hay eventos programados</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
