"use client"

import type React from "react"
import { MobileSidebar } from "@/components/layout/mobile-sidebar"
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Edit, Users, Clock, Hash } from "lucide-react"
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
import { TimeSelector } from "@/components/ui/time-selector"

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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-friendly sidebar */}
      <MobileSidebar />

      {/* Main content */}
      <div className="w-full md:ml-[4rem] px-3 md:px-6 py-4 md:py-6">
        <main className="max-w-full">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">Dashboard del Club {clubData.name}</h1>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" /> Crear Partido
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Partido</DialogTitle>
                  <DialogDescription>
                    Ingresa los detalles del nuevo partido aquí. Haz clic en guardar cuando hayas terminado.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Fecha</Label>
                    <Input id="date" type="date" value={newMatch.date} onChange={(e) => handleInputChange(e)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="startTime">Hora de Inicio</Label>
                    <TimeSelector
                      id="startTime"
                      value={newMatch.startTime}
                      onChange={(val) => setNewMatch((prev) => ({ ...prev, startTime: val }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endTime">Hora de Fin</Label>
                    <TimeSelector
                      id="endTime"
                      value={newMatch.endTime}
                      onChange={(val) => setNewMatch((prev) => ({ ...prev, endTime: val }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="court">Cancha</Label>
                    <Input id="court" value={newMatch.court} onChange={(e) => handleInputChange(e)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="price">Precio</Label>
                    <Input
                      id="price"
                      type="text"
                      value={newMatch.price}
                      onChange={(e) => handleInputChange(e)}
                      onInput={(e) => {
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
              <DialogContent className="w-[95vw] max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Editar Partido</DialogTitle>
                  <DialogDescription>
                    Modifica los detalles del partido aquí. Haz clic en guardar cuando hayas terminado.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Fecha</Label>
                    <Input
                      id="date"
                      type="date"
                      value={editMatch ? new Date(editMatch.date).toISOString().split("T")[0] : ""}
                      onChange={(e) => handleInputChange(e, true)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="startTime">Hora de Inicio</Label>
                    <TimeSelector
                      id="startTime"
                      value={editMatch?.startTime || ""}
                      onChange={(val) => setEditMatch((prev) => (prev ? { ...prev, startTime: val } : prev))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endTime">Hora de Fin</Label>
                    <TimeSelector
                      id="endTime"
                      value={editMatch?.endTime || ""}
                      onChange={(val) => setEditMatch((prev) => (prev ? { ...prev, endTime: val } : prev))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="court">Cancha</Label>
                    <Input id="court" value={editMatch.court} onChange={(e) => handleInputChange(e, true)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="price">Precio</Label>
                    <Input
                      id="price"
                      type="text"
                      value={editMatch?.price === 0 ? "" : editMatch?.price}
                      onChange={(e) => handleInputChange(e, true)}
                      onInput={(e) => {
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
            <Card className="w-full overflow-hidden">
              <CardHeader className="p-3 md:p-6">
                <CardTitle className="text-lg md:text-xl">Calendario de Partidos</CardTitle>
                <CardDescription>Vista mensual de los partidos programados</CardDescription>
              </CardHeader>
              <CardContent className="p-2 md:p-6">
                <div className="max-w-full overflow-x-auto">
                  <Calendar
                    value={currentDate}
                    onChange={(date) => setSelectedDate(date as Date)}
                    tileClassName={tileClassName}
                    className="w-full text-sm md:text-base"
                  />
                </div>
                <Button onClick={resetDateFilter} className="mt-4 w-full">
                  Mostrar Todos los Partidos
                </Button>
              </CardContent>
            </Card>
            <Card className="w-full md:col-span-2">
              <CardHeader className="p-3 md:p-6">
                <CardTitle className="text-lg md:text-xl">Partidos Próximos</CardTitle>
                <CardDescription>Administra los partidos programados</CardDescription>
              </CardHeader>
              <CardContent className="p-2 md:p-6">
                <div className="space-y-3">
                  {filteredMatches.map((match) => (
                    <div
                      key={match.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-green-100 rounded-lg hover:bg-green-50 transition-colors duration-300 cursor-pointer relative"
                      onClick={() => handleMatchClick(match)}
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-1 gap-1 sm:gap-0">
                        <p className="font-semibold text-gray-800 col-span-2">{formatearFecha(match.date)}</p>
                        <p className="text-xs md:text-sm text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {match.startTime} - {match.endTime}
                        </p>
                        <p className="text-xs md:text-sm text-gray-500 flex items-center">
                          <Hash className="w-3 h-3 mr-1" />
                          {match.court}
                        </p>
                        <p className="text-xs md:text-sm text-gray-500 flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {match.players}/4
                        </p>
                        <span className="text-xs md:text-sm font-semibold text-green-600">${match.price}</span>
                      </div>
                      <div
                        className="flex space-x-2 mt-2 sm:mt-0 self-end sm:self-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleEditMatch(match)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDeleteMatch(match.id)}
                        >
                          <Trash2 className="h-3 w-3" />
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
          <DialogContent className="w-[95vw] max-w-[425px]">
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
