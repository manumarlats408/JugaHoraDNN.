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
import { TimeSelector } from "@/components/ui/time-selector"



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
  price: number
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
  const [loadingEventoDetails, setLoadingEventoDetails] = useState<{ [key: number]: boolean }>({})
  const [selectedEventoTipo, setSelectedEventoTipo] = useState<string | null>(null)
  const [joinedUsers, setJoinedUsers] = useState<string[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newEvento, setNewEvento] = useState({
    nombre: "",
    date: "",
    startTime: "",
    endTime: "",
    categoria: "",
    genero: "mixto",
    tipo: "cancha_abierta",
    formato: "eliminacion_directa",
    maxParejas: 0,
    price: 0,
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
      setFilteredEventos(eventos);
    } else {
      const selectedDateString = selectedDate.toISOString().split("T")[0];
      const filtered = eventos.filter(evento => {
        const eventoDateString = new Date(evento.date).toISOString().split("T")[0];
        return selectedDateString === eventoDateString;
      });
      setFilteredEventos(filtered);
    }
  }, [eventos, selectedDate]);
  

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>, isEdit = false) => {
    const { name, value } = e.target
  
    if (isEdit && editEvento) {
      const updatedEvento = {
        ...editEvento,
        [name]: name === "maxParejas" ? parseInt(value) : value,
      }
  
      if (name === "tipo") {
        if (value === "torneo") {
          updatedEvento.formato = editEvento.formato || "eliminacion_directa"
        } else if (value === "cancha_abierta") {
          updatedEvento.formato = null
        }
      }
  
      setEditEvento(updatedEvento)
    } else {
      const updatedEvento = {
        ...newEvento,
        [name]: name === "maxParejas" ? parseInt(value) : value,
      }
  
      if (name === "tipo") {
        if (value === "torneo") {
          updatedEvento.formato = newEvento.formato || "eliminacion_directa"
        } else if (value === "cancha_abierta") {
          updatedEvento.formato = ""
        }
      }
  
      setNewEvento(updatedEvento)
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
          price: 0,
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

  const formatearFecha = (fechaString: string) => {
    const partes = fechaString.split("T")[0].split("-")
    if (partes.length !== 3) return fechaString
  
    const año = partes[0]
    const mes = partes[1]
    const dia = partes[2]
  
    return `${dia}/${mes}/${año}`
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

  const handleEventoClick = async (eventoId: number, tipo: string) => {
    setSelectedEventoTipo(tipo)
  
    // Activar loading solo en la tarjeta clickeada
    setLoadingEventoDetails(prev => ({ ...prev, [eventoId]: true }))
  
    try {
      const res = await fetch(`/api/eventos/${eventoId}/parejas`)
      if (res.ok) {
        const data = await res.json()
        setJoinedUsers(data)
        setIsModalOpen(true)
      } else {
        toast.error("No se pudieron obtener los datos del evento")
      }
    } catch (err) {
      console.error("Error al obtener datos del evento:", err)
      toast.error("Error al conectar con el servidor")
    } finally {
      // Desactivar loading
      setLoadingEventoDetails(prev => ({ ...prev, [eventoId]: false }))
    }
  }
  
  

  // const tileClassName = ({ date, view }: { date: Date; view: string }) => {
  //   if (view === "month") {
  //     const match = eventos.find(e => new Date(e.date).toDateString() === date.toDateString())
  //     return match ? "bg-blue-200" : undefined
  //   }
  // }

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
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nombre" className="text-right">Nombre</Label>
                  <Input id="nombre" name="nombre" className="col-span-3" value={newEvento.nombre} onChange={handleInputChange} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">Fecha</Label>
                  <Input id="date" name="date" type="date" className="col-span-3" value={newEvento.date} onChange={handleInputChange} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="startTime" className="text-right">Hora de Inicio</Label>
                  <TimeSelector
                    id="startTime"
                    value={newEvento.startTime}
                    onChange={(val) => setNewEvento((prev) => ({ ...prev, startTime: val }))}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="endTime" className="text-right">Hora de Fin</Label>
                  <TimeSelector
                    id="endTime"
                    value={newEvento.endTime}
                    onChange={(val) => setNewEvento((prev) => ({ ...prev, endTime: val }))}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="categoria" className="text-right">Categoría</Label>
                  <Input id="categoria" name="categoria" placeholder="Ej: 5" className="col-span-3" value={newEvento.categoria} onChange={handleInputChange} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="genero" className="text-right">Género</Label>
                  <select id="genero" name="genero" className="col-span-3 border rounded p-2" value={newEvento.genero} onChange={handleInputChange}>
                    <option value="mixto">Mixto</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tipo" className="text-right">Tipo</Label>
                  <select id="tipo" name="tipo" className="col-span-3 border rounded p-2" value={newEvento.tipo} onChange={handleInputChange}>
                    <option value="cancha_abierta">Cancha Abierta</option>
                    <option value="torneo">Torneo</option>
                  </select>
                </div>
                {newEvento.tipo === "torneo" && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="formato" className="text-right">Formato</Label>
                    <select id="formato" name="formato" className="col-span-3 border rounded p-2" value={newEvento.formato || "eliminacion_directa"} onChange={handleInputChange}>
                      <option value="eliminacion_directa">Eliminación Directa</option>
                      <option value="grupos">Grupos</option>
                    </select>
                  </div>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="maxParejas" className="text-right">Cantidad de Parejas</Label>
                  <Input id="maxParejas" name="maxParejas" type="number" className="col-span-3" value={newEvento.maxParejas} onChange={handleInputChange} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">Precio</Label>
                  <Input id="price" name="price" placeholder="Ej: 14000" type="text" className="col-span-3" value={newEvento.price || ""} onChange={handleInputChange} onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "")
                  }} />
                </div>
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
          <TimeSelector
            id="startTime"
            value={editEvento?.startTime || ""}
            onChange={(val) =>
              setEditEvento((prev) => (prev ? { ...prev, startTime: val } : prev))
            }
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="endTime" className="text-right">Hora de Fin</Label>
          <TimeSelector
            id="endTime"
            value={editEvento?.endTime || ""}
            onChange={(val) =>
              setEditEvento((prev) => (prev ? { ...prev, endTime: val } : prev))
            }
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="categoria" className="text-right">Categoría</Label>
          <Input id="categoria" name="categoria" className="col-span-3" value={editEvento.categoria} onChange={(e) => handleInputChange(e, true)} />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="genero" className="text-right">Género</Label>
          <select
            id="genero"
            name="genero"
            className="col-span-3 border rounded p-2"
            value={editEvento.genero}
            onChange={(e) => handleInputChange(e, true)}
          >
            <option value="mixto">Mixto</option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
          </select>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="tipo" className="text-right">Tipo</Label>
          <select
            id="tipo"
            name="tipo"
            className="col-span-3 border rounded p-2"
            value={editEvento.tipo}
            onChange={(e) => handleInputChange(e, true)}
          >
            <option value="cancha_abierta">Cancha Abierta</option>
            <option value="torneo">Torneo</option>
          </select>
        </div>

        {editEvento.tipo === "torneo" && (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="formato" className="text-right">Formato</Label>
            <select
              id="formato"
              name="formato"
              className="col-span-3 border rounded p-2"
              value={editEvento.formato || "eliminacion_directa"}
              onChange={(e) => handleInputChange(e, true)}
            >
              <option value="eliminacion_directa">Eliminación Directa</option>
              <option value="grupos">Grupos</option>
            </select>
          </div>
        )}

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="maxParejas" className="text-right">Cantidad de Parejas</Label>
          <Input id="maxParejas" name="maxParejas" type="number" className="col-span-3" value={editEvento.maxParejas} onChange={(e) => handleInputChange(e, true)} />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="price" className="text-right">Precio</Label>
          <Input id="price" name="price" type="number" className="col-span-3" value={editEvento.price} onChange={(e) => handleInputChange(e, true)} />
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
            <Calendar
              value={selectedDate || new Date()}
              onChange={(date) => setSelectedDate(date as Date)}
              tileClassName={({ date, view }) => {
                if (view === "month") {
                  const eventoDate = eventos.find((evento) =>
                    new Date(evento.date).toDateString() === date.toDateString()
                  );
                  return eventoDate ? "bg-green-200" : null;
                }
              }}
            />
            <Button onClick={() => setSelectedDate(null)} className="mt-4">
              Mostrar Todos los Eventos
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
                      className="cursor-pointer relative flex items-center justify-between p-4 border border-blue-100 rounded-lg hover:bg-blue-50 transition-colors duration-300"
                      onClick={() => handleEventoClick(evento.id, evento.tipo)}
                    >
                      <div>
                        <p className="font-semibold text-gray-800">{evento.nombre}</p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-1" /> {formatearFecha(evento.date)}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Clock className="w-4 h-4 mr-1" /> {evento.startTime} - {evento.endTime}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Trophy className="w-4 h-4 mr-1" /> Nivel {evento.categoria} ({evento.genero})
                        </p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Hash className="w-4 h-4 mr-1" />{" "}
                          {evento.tipo.charAt(0).toUpperCase() + evento.tipo.slice(1).replace("_", " ")}{" "}
                          {evento.tipo === "torneo" && evento.formato
                            ? ` - Formato: ${evento.formato.replace("_", " ")}`
                            : ""}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Users className="w-4 h-4 mr-1" />{" "}
                          {evento.parejas?.length || 0}/{evento.maxParejas}{" "}
                          {evento.tipo === "cancha_abierta" ? "personas" : "parejas"}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <span className="text-sm font-semibold text-green-600">
                            Precio: ${evento.price}
                          </span>
                        </p>
                      </div>
                  
                      <div className="flex space-x-2 z-20">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditEvento(evento)
                            setIsEditModalOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                  
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(evento.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                  
                      {/* LOADING OVERLAY */}
                      {loadingEventoDetails[evento.id] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-lg z-10">
                          <svg
                            className="animate-spin h-5 w-5 text-blue-600"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        </div>
                      )}
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
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedEventoTipo === "torneo" ? "Parejas Inscritas" : "Personas Inscritas"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {joinedUsers.length > 0 ? (
              <ul className="space-y-2">
                {joinedUsers.map((user, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{user}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500">
                {selectedEventoTipo === "torneo"
                  ? "No hay parejas inscritas."
                  : "No hay personas inscritas."}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsModalOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
