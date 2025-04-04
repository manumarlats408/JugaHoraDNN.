"use client"

import type React from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Plus, Trash2, Edit, Users, Clock, Hash } from "lucide-react"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as DatePickerCalendar } from "@/components/ui/calendar"
import { format } from "date-fns"

type Match = {
  id: number
  date: string
  startTime: string
  endTime: string
  court: string
  players: number
  price: number
}

type Club = {
  id: string
  name: string
  email: string
  phoneNumber?: string
  address?: string
}

type User = {
  id: number
  firstName: string
  lastName: string
}

export function ClubDashboard() {
  const [currentDate] = useState<Date>(new Date())
  const [matches, setMatches] = useState<Match[]>([])
  const [newMatch, setNewMatch] = useState({ date: "", startTime: "", endTime: "", court: "", price: "" })
  const [editMatch, setEditMatch] = useState<Match | null>(null)
  const [editSelectedDate, setEditSelectedDate] = useState<Date | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [clubData, setClubData] = useState<Club | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([])
  const [loadingMatches, setLoadingMatches] = useState<{ [key: number]: boolean }>({})
  const [joinedUsers, setJoinedUsers] = useState<User[]>([])
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const router = useRouter()

  const resetDateFilter = () => {
    setSelectedDate(null) // Restablece selectedDate a null para mostrar todos los partidos
  }

  const fetchMatches = useCallback(async () => {
    if (!clubData) return
    try {
      const response = await fetch(`/api/matches?clubId=${clubData.id}`, {
        method: "GET",
        credentials: "include",
      })
      if (response.ok) {
        const matchesData = await response.json()
        setMatches(matchesData)
        setFilteredMatches(matchesData) // Inicializamos los partidos filtrados
      } else {
        console.error("Error al obtener los partidos del club:", await response.text())
      }
    } catch (error) {
      console.error("Error al conectar con la API para obtener los partidos:", error)
    }
  }, [clubData])

  const formatearFecha = (fechaString: string) => {
    const partes = fechaString.split("T")[0].split("-")
    if (partes.length !== 3) return fechaString
  
    const año = partes[0]
    const mes = partes[1]
    const dia = partes[2]
  
    return `${dia}/${mes}/${año}`
  }

  const handleMatchClick = async (match: Match) => {
    setLoadingMatches((prev) => ({ ...prev, [match.id]: true }))
    try {
      const response = await fetch(`/api/matches/${match.id}/users`)
      if (response.ok) {
        const users = await response.json()
        setJoinedUsers(users)
        setIsUserModalOpen(true)
      } else {
        console.error("Error al obtener los usuarios del partido:", await response.text())
      }
    } catch (error) {
      console.error("Error al conectar con la API para obtener los usuarios:", error)
    } finally {
      setLoadingMatches((prev) => ({ ...prev, [match.id]: false }))
    }
  }

  useEffect(() => {
    const fetchClubProfile = async () => {
      try {
        setIsLoading(true)
        const authResponse = await fetch("/api/auth", {
          method: "GET",
          credentials: "include",
        })

        if (authResponse.ok) {
          const data = await authResponse.json()
          const club = data.entity
          setClubData(club)
        } else {
          throw new Error("Failed to fetch club data")
        }
      } catch (error) {
        console.error("Error al obtener el perfil del club:", error)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    fetchClubProfile()
  }, [router])

  useEffect(() => {
    if (clubData) {
      fetchMatches()
    }
  }, [clubData, fetchMatches])

  // Nuevo useEffect para filtrar los partidos por fecha
  useEffect(() => {
    if (!selectedDate) {
      setFilteredMatches(matches) // Si no hay una fecha seleccionada, mostrar todos los partidos
    } else {
      const filtered = matches.filter((match) => {
        // Convertir las fechas a 'YYYY-MM-DD' para una comparación precisa
        const selectedDateString = selectedDate.toISOString().split("T")[0]
        const matchDateString = new Date(match.date).toISOString().split("T")[0]

        return selectedDateString === matchDateString
      })

      setFilteredMatches(filtered)
    }
  }, [matches, selectedDate])

  

  const handleCreateMatch = async () => {
    if (!clubData) return
    try {
      const response = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newMatch, clubId: clubData.id.toString(), price: Number.parseFloat(newMatch.price) }),
      })

      if (response.ok) {
        const createdMatch = await response.json()
        setMatches([...matches, createdMatch])
        setNewMatch({ date: "", startTime: "", endTime: "", court: "", price: "" })
      } else {
        console.error("Error al crear el partido:", await response.text())
      }
    } catch (error) {
      console.error("Error al conectar con la API para crear el partido:", error)
    }
  }

  const handleDeleteMatch = async (id: number) => {
    try {
      const response = await fetch(`/api/matches/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setMatches(matches.filter((match) => match.id !== id))
      } else {
        console.error("Error al eliminar el partido:", await response.text())
      }
    } catch (error) {
      console.error("Error al conectar con la API para eliminar el partido:", error)
    }
  }

  const handleEditMatch = (match: Match) => {
    setEditMatch(match)
  
    if (match.date) {
      const [year, month, day] = match.date.split("T")[0].split("-").map(Number)
      setEditSelectedDate(new Date(year, month - 1, day))
    }
  
    setIsEditModalOpen(true)
  }
  
  const handleSaveEdit = async () => {
    if (!editMatch) return

    try {
      const response = await fetch(`/api/matches/${editMatch.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: editMatch.date,
          startTime: editMatch.startTime,
          endTime: editMatch.endTime,
          court: editMatch.court,
          price: editMatch.price,
        }),
      })

      if (response.ok) {
        const updatedMatch = await response.json()
        setMatches(matches.map((match) => (match.id === updatedMatch.id ? updatedMatch : match)))
        setEditMatch(null)
        setIsEditModalOpen(false)
      } else {
        console.error("Error al actualizar el partido:", await response.text())
      }
    } catch (error) {
      console.error("Error al conectar con la API para actualizar el partido:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const { id, value } = e.target

    if (isEdit && editMatch) {
      setEditMatch((prev) => {
        if (!prev) return prev
        // Si el campo es `price`, permite que el valor sea vacío temporalmente
        const updatedValue = id === "price" ? (value === "" ? "" : Number.parseFloat(value)) : value
        return { ...prev, [id]: updatedValue }
      })
    } else {
      setNewMatch((prev) => ({
        ...prev,
        [id]: id === "price" ? (value === "" ? "" : Number.parseFloat(value)) : value,
      }))
    }
  }

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const matchDate = matches.find((match) => new Date(match.date).toDateString() === date.toDateString())
      return matchDate ? "bg-green-200" : null
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-lg text-gray-600">Cargando dashboard del club...</p>
      </div>
    )
  }

  if (!clubData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-lg text-gray-600">No se pudo cargar el dashboard del club. Por favor, inténtalo de nuevo.</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
              {/* Sidebar fijo */}
              <Sidebar />
            <div className="flex-1 ml-[4rem] p-6 space-y-6 overflow-auto">
      <main className="flex-1 p-4 md:p-6 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard del Club {clubData.name}</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Crear Partido
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Partido</DialogTitle>
                <DialogDescription>
                  Ingresa los detalles del nuevo partido aquí. Haz clic en guardar cuando hayas terminado.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">
                    Fecha
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    className="col-span-3"
                    value={newMatch.date}
                    onChange={(e) => handleInputChange(e)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="startTime" className="text-right">
                    Hora de Inicio
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    className="col-span-3"
                    value={newMatch.startTime}
                    onChange={(e) => handleInputChange(e)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="endTime" className="text-right">
                    Hora de Fin
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    className="col-span-3"
                    value={newMatch.endTime}
                    onChange={(e) => handleInputChange(e)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="court" className="text-right">
                    Cancha
                  </Label>
                  <Input
                    id="court"
                    className="col-span-3"
                    value={newMatch.court}
                    onChange={(e) => handleInputChange(e)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Precio
                  </Label>
                  <Input
                    id="price"
                    type="text" // Cambiado de "number" a "text" para quitar las flechas
                    className="col-span-3"
                    value={newMatch.price} // Permitir que se muestre vacío si es 0
                    onChange={(e) => handleInputChange(e)}
                    onInput={(e) => {
                      // Permitir solo números
                      e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "")
                    }}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateMatch}>Guardar Partido</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {editMatch && (
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Editar Partido</DialogTitle>
                <DialogDescription>
                  Modifica los detalles del partido aquí. Haz clic en guardar cuando hayas terminado.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">Fecha</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between font-normal"
                    >
                      {editSelectedDate ? format(editSelectedDate, "dd/MM/yyyy") : "Seleccionar fecha"}
                      <CalendarIcon className="ml-2 h-4 w-4" />
                    </Button>

                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <DatePickerCalendar
                      mode="single"
                      selected={editSelectedDate || undefined}
                      onSelect={(date) => {
                        if (!date) return

                        setEditSelectedDate(date)

                        // Convertimos a formato yyyy-mm-dd sin desfase
                        const year = date.getFullYear()
                        const month = String(date.getMonth() + 1).padStart(2, "0")
                        const day = String(date.getDate()).padStart(2, "0")
                        const formattedDate = `${year}-${month}-${day}`

                        setEditMatch((prev) => prev ? { ...prev, date: formattedDate } : null)
                      }}
                      showOutsideDays={false}
                      initialFocus
                    />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="startTime" className="text-right">
                    Hora de Inicio
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    className="col-span-3"
                    value={editMatch?.startTime || ""}
                    onChange={(e) => handleInputChange(e, true)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="endTime" className="text-right">
                    Hora de Fin
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    className="col-span-3"
                    value={editMatch?.endTime || ""}
                    onChange={(e) => handleInputChange(e, true)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="court" className="text-right">
                    Cancha
                  </Label>
                  <Input
                    id="court"
                    className="col-span-3"
                    value={editMatch.court}
                    onChange={(e) => handleInputChange(e, true)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Precio
                  </Label>
                  <Input
                    id="price"
                    type="text" // Cambiado de "number" a "text" para quitar las flechas
                    className="col-span-3"
                    value={editMatch?.price === 0 ? "" : editMatch?.price} // Permitir que se muestre vacío si es 0
                    onChange={(e) => handleInputChange(e, true)}
                    onInput={(e) => {
                      // Permitir solo números
                      e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "")
                    }}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSaveEdit}>Guardar Cambios</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Calendario de Partidos</CardTitle>
              <CardDescription>Vista mensual de los partidos programados</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                value={currentDate}
                onChange={(date) => setSelectedDate(date as Date)}
                tileClassName={tileClassName}
              />
              <Button onClick={resetDateFilter} className="mt-4">
                Mostrar Todos los Partidos
              </Button>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Partidos Próximos</CardTitle>
              <CardDescription>Administra los partidos programados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredMatches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-4 border border-green-100 rounded-lg hover:bg-green-50 transition-colors duration-300 cursor-pointer relative"
                    onClick={() => handleMatchClick(match)}
                  >
                    <div>
                      <p className="font-semibold text-gray-800">{formatearFecha(match.date)}</p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        {formatearFecha(match.date)}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {match.startTime} - {match.endTime}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Hash className="w-4 h-4 mr-1" />
                        {match.court}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {match.players}/4
                      </p>
                      <span className="text-sm font-semibold text-green-600">${match.price}</span>
                    </div>
                    <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                      <Button variant="outline" size="icon" onClick={() => handleEditMatch(match)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDeleteMatch(match.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {loadingMatches[match.id] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-lg">
                        <svg
                          className="animate-spin h-5 w-5 text-green-600"
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
                ))}
                {filteredMatches.length === 0 && (
                  <p className="text-center text-gray-500">No se encontraron partidos para esta fecha.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Usuarios Unidos al Partido</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {joinedUsers.length > 0 ? (
              <ul className="space-y-2">
                {joinedUsers.map((user) => (
                  <li key={user.id} className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{`${user.firstName} ${user.lastName}`}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500">No hay usuarios unidos a este partido.</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsUserModalOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </div>
  )
}

