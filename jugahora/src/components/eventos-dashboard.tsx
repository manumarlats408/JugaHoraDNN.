"use client"

import { useEffect, useState, useCallback, ChangeEvent } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Plus, Trash2, Edit, Users, Clock, Trophy, Hash } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { toast } from "react-hot-toast"


type Evento = {
  id: number
  nombre: string
  date: string
  startTime: string
  endTime: string
  categoria: string
  genero: string
  tipo: string
  formato: string | null
  maxParejas: number
  parejas: { id: number }[]
}

type Club = {
  id: string
  name: string
}

export function EventosDashboard() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [filteredEventos, setFilteredEventos] = useState<Evento[]>([])
  const [clubData, setClubData] = useState<Club | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [editEvento, setEditEvento] = useState<Evento | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
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
    try {
      const res = await fetch(`/api/eventos?clubId=${clubData.id}`)
      const data = await res.json()
      setEventos(data)
      setFilteredEventos(data)
    } catch (err) {
      console.error("Error al obtener eventos:", err)
    }
  }, [clubData])

  useEffect(() => {
    const cargarClub = async () => {
      const res = await fetch("/api/auth", { credentials: "include" })
      const data = await res.json()
      setClubData(data.entity)
    }
    cargarClub()
  }, [])

  useEffect(() => {
    if (clubData) fetchEventos()
  }, [clubData, fetchEventos])

  useEffect(() => {
    if (!selectedDate) {
      setFilteredEventos(eventos)
    } else {
      const selected = selectedDate.toISOString().split("T")[0]
      setFilteredEventos(eventos.filter(e => e.date === selected))
    }
  }, [selectedDate, eventos])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>, isEdit = false) => {
    const { name, value } = e.target
    if (isEdit && editEvento) {
      setEditEvento({ ...editEvento, [name]: name === "maxParejas" ? parseInt(value) : value })
    } else {
      setNewEvento(prev => ({ ...prev, [name]: name === "maxParejas" ? parseInt(value) : value }))
    }
  }

  const handleCrearEvento = async () => {
    if (!clubData) return
  
    try {
      const res = await fetch("/api/eventos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newEvento, clubId: clubData.id }),
      })
  
      if (res.ok) {
        const creado = await res.json()
        setEventos([...eventos, creado])
        
        // 🔁 Resetear el formulario
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
  
        // ✅ Mostrar notificación
        toast.success("Evento creado exitosamente!")
      } else {
        const errorData = await res.json()
        toast.error(errorData.error || "Error al crear el evento")
      }
    } catch (error) {
      console.error("Error al crear evento:", error)
      toast.error("Error al conectar con el servidor")
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/eventos/${id}`, { method: "DELETE" })
      if (res.ok) setEventos(eventos.filter(ev => ev.id !== id))
    } catch (err) {
      console.error("Error al eliminar evento:", err)
    }
  }

  const handleEdit = async () => {
    if (!editEvento) return
    try {
      const res = await fetch(`/api/eventos/${editEvento.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editEvento),
      })
      if (res.ok) {
        const actualizado = await res.json()
        setEventos(eventos.map(ev => (ev.id === actualizado.id ? actualizado : ev)))
        setEditEvento(null)
        setIsEditModalOpen(false)
      }
    } catch (err) {
      console.error("Error al editar evento:", err)
    }
  }

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const match = eventos.find(e => new Date(e.date).toDateString() === date.toDateString())
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
              <Button><Plus className="mr-2 h-4 w-4" /> Crear Evento</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Crear Evento</DialogTitle>
                <DialogDescription>Complete la información del evento</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input name="nombre" placeholder="Nombre" onChange={handleInputChange} />
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
                <Input type="number" name="maxParejas" placeholder="Cantidad de Parejas" onChange={handleInputChange} />
              </div>
              <DialogFooter>
                <Button onClick={handleCrearEvento}>Guardar Evento</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {editEvento && (
  <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Editar Evento</DialogTitle>
        <DialogDescription>Modificá los datos del evento</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="nombre" className="text-right">Nombre</Label>
          <Input id="nombre" name="nombre" className="col-span-3" value={editEvento.nombre} onChange={(e) => handleInputChange(e, true)} />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="date" className="text-right">Fecha</Label>
          <Input id="date" name="date" type="date" className="col-span-3" value={new Date(editEvento.date).toISOString().split("T")[0]} onChange={(e) => handleInputChange(e, true)} />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="startTime" className="text-right">Hora de Inicio</Label>
          <Input id="startTime" name="startTime" className="col-span-3" value={editEvento.startTime} onChange={(e) => handleInputChange(e, true)} />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="endTime" className="text-right">Hora de Fin</Label>
          <Input id="endTime" name="endTime" className="col-span-3" value={editEvento.endTime} onChange={(e) => handleInputChange(e, true)} />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="categoria" className="text-right">Categoría</Label>
          <Input id="categoria" name="categoria" className="col-span-3" value={editEvento.categoria} onChange={(e) => handleInputChange(e, true)} />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="maxParejas" className="text-right">Cantidad de Parejas</Label>
          <Input id="maxParejas" name="maxParejas" type="number" className="col-span-3" value={editEvento.maxParejas} onChange={(e) => handleInputChange(e, true)} />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={handleEdit}>Guardar Cambios</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)}


        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Calendario de Eventos</CardTitle>
              <CardDescription>Vista mensual</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar value={selectedDate || new Date()} onChange={(d) => setSelectedDate(d as Date)} tileClassName={tileClassName} />
              <Button onClick={() => setSelectedDate(null)} className="mt-4">Ver Todos</Button>
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
                    <div key={evento.id} className="flex items-center justify-between p-4 border border-blue-100 rounded-lg hover:bg-blue-50">
                      <div>
                        <p className="font-semibold text-gray-800">{evento.nombre}</p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-1" /> {evento.date}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Clock className="w-4 h-4 mr-1" /> {evento.startTime} - {evento.endTime}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Trophy className="w-4 h-4 mr-1" /> Nivel {evento.categoria} ({evento.genero})
                        </p>
                        <p className="text-sm text-gray-500 flex items-center">
                        <Hash className="w-4 h-4 mr-1" /> {evento.tipo.charAt(0).toUpperCase() + evento.tipo.slice(1).replace("_", " ")} 
                          {evento.tipo === "torneo" && evento.formato ? ` - Formato: ${evento.formato.replace("_", " ")}` : ""}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Users className="w-4 h-4 mr-1" /> {evento.parejas?.length || 0}/{evento.maxParejas} parejas
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="icon" onClick={() => { setEditEvento(evento); setIsEditModalOpen(true) }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleDelete(evento.id)}>
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
