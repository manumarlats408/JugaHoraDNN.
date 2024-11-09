'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { CalendarIcon, Plus, Trash2, Edit, Users, Clock, MapPin, Bell} from "lucide-react"
import Image from 'next/image'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { format } from 'date-fns';

type ValuePiece = Date | null
type Value = ValuePiece | [ValuePiece, ValuePiece]

type Match = {
  id: number
  date: string
  time: string
  court: string
  players: number
}

type Club = {
  id: string
  name: string
  email: string
  phoneNumber?: string
  address?: string
}

export default function ClubDashboard() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [matches, setMatches] = useState<Match[]>([])
  const [newMatch, setNewMatch] = useState({ date: '', time: '', court: '' })
  const [editMatch, setEditMatch] = useState<Match | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [clubData, setClubData] = useState<Club | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const fetchMatches = useCallback(async () => {
    if (!clubData) return;
    try {
      const response = await fetch(`/api/matches?clubId=${clubData.id}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        const matchesData = await response.json();
        setMatches(matchesData);
      } else {
        console.error('Error al obtener los partidos del club:', await response.text());
      }
    } catch (error) {
      console.error('Error al conectar con la API para obtener los partidos:', error);
    }
  }, [clubData]);

  useEffect(() => {
    const fetchClubProfile = async () => {
      try {
        setIsLoading(true)
        const authResponse = await fetch('/api/auth', {
          method: 'GET',
          credentials: 'include',
        })

        if (authResponse.ok) {
          const data = await authResponse.json()
          const club = data.entity
          setClubData(club)


        } else {
          throw new Error('Failed to fetch club data')
        }
      } catch (error) {
        console.error('Error al obtener el perfil del club:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    fetchClubProfile()
  }, [router])

  useEffect(() => {
    if (clubData) {
      fetchMatches();
    }
  }, [clubData, fetchMatches]);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'GET',
        credentials: 'include',
      })
      router.push('/')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const handleCreateMatch = async () => {
    if (!clubData) return;
    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newMatch, clubId: clubData.id.toString() }),
      });

      if (response.ok) {
        const createdMatch = await response.json();
        setMatches([...matches, createdMatch]);
        setNewMatch({ date: '', time: '', court: '' });
      } else {
        console.error('Error al crear el partido:', await response.text());
      }
    } catch (error) {
      console.error('Error al conectar con la API para crear el partido:', error);
    }
  };

  const handleDeleteMatch = async (id: number) => {
    try {
      const response = await fetch(`/api/matches/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setMatches(matches.filter(match => match.id !== id))
      } else {
        console.error('Error al eliminar el partido:', await response.text())
      }
    } catch (error) {
      console.error('Error al conectar con la API para eliminar el partido:', error)
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
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: editMatch.date,
          time: editMatch.time,
          court: editMatch.court,
        }),
      })
  
      if (response.ok) {
        const updatedMatch = await response.json()
        setMatches(matches.map(match => (match.id === updatedMatch.id ? updatedMatch : match)))
        setEditMatch(null)
        setIsEditModalOpen(false)
      } else {
        console.error('Error al actualizar el partido:', await response.text())
      }
    } catch (error) {
      console.error('Error al conectar con la API para actualizar el partido:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const { id, value } = e.target
    if (isEdit && editMatch) {
      setEditMatch((prev) => (prev ? { ...prev, [id]: value } : prev))
    } else {
      setNewMatch((prev) => ({ ...prev, [id]: value }))
    }
  }

  const handleDateChange = (value: Value) => {
    if (value instanceof Date) {
      setCurrentDate(value)
    } else if (Array.isArray(value) && value[0] instanceof Date) {
      setCurrentDate(value[0])
    }
  }

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const matchDate = matches.find(match => new Date(match.date).toDateString() === date.toDateString())
      return matchDate ? 'bg-green-200' : null
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
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b">
        <Link className="flex items-center justify-center" href="/">
          <Image src='/logo.svg' alt="JugáHora Logo" width={32} height={32} /> 
          <span className="ml-2 text-xl font-bold">JugáHora</span>
        </Link>
        <nav className="flex gap-4 sm:gap-6 items-center">
          <DropdownMenu
            trigger={
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notificaciones</span>
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-600"></span>
              </Button>
            }
          >
            <div className="px-4 py-3 text-sm text-gray-900 dark:text-white">
              <div className="font-medium">Notificaciones</div>
            </div>
            <DropdownMenuItem>
              <div className="flex flex-col">
                <span className="font-medium">Nuevo partido creado</span>
                <span className="text-sm text-gray-500">Cancha 1, hoy a las 18:00</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex flex-col">
                <span className="font-medium">Recordatorio: Mantenimiento</span>
                <span className="text-sm text-gray-500">Cancha 3, mañana a las 10:00</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex flex-col">
                <span className="font-medium">Partido cancelado</span>
                <span className="text-sm text-gray-500">Cancha 2, 20/03 a las 19:00</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenu>
          <button
            className="text-sm font-medium hover:underline underline-offset-4"
            onClick={handleLogout}
          >
            Cerrar Sesión
          </button>
        </nav>
      </header>
      <main className="flex-1 p-4 md:p-6 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard del Club {clubData.name}</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Crear Partido</Button>
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
                  <Label htmlFor="date" className="text-right">Fecha</Label>
                  <Input id="date" type="date" className="col-span-3" value={newMatch.date} onChange={(e) => handleInputChange(e)} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="time" className="text-right">Hora</Label>
                  <Input id="time" type="time" className="col-span-3" value={newMatch.time} onChange={(e) => handleInputChange(e)} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="court" className="text-right">Cancha</Label>
                  <Input id="court" className="col-span-3" value={newMatch.court} onChange={(e) => handleInputChange(e)} />
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
                  <Input
                    id="date"
                    type="date"
                    className="col-span-3"
                    value={editMatch ? new Date(editMatch.date).toISOString().split('T')[0] : ""}
                    onChange={(e) => handleInputChange(e, true)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="time" className="text-right">Hora</Label>
                  <Input id="time" type="time" className="col-span-3" value={editMatch.time} onChange={(e) => handleInputChange(e, true)} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="court" className="text-right">Cancha</Label>
                  <Input id="court" className="col-span-3" value={editMatch.court} onChange={(e) => handleInputChange(e, true)} />
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
                onChange={handleDateChange}
                tileClassName={tileClassName}
              />
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Partidos Próximos</CardTitle>
              <CardDescription>Administra los partidos programados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {matches.map(match => (
                  <div key={match.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <CalendarIcon className="h-6 w-6 text-gray-400" />
                      <div>
                      <p className="font-medium">{format(new Date(match.date), 'yyyy-MM-dd')}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="mr-1 h-4 w-4" />
                          {match.time}
                          <MapPin className="ml-2 mr-1 h-4 w-4" />
                          {match.court}
                          <Users className="ml-2 mr-1 h-4 w-4" />
                          {match.players}/4
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditMatch(match)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDeleteMatch(match.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          © 2024 JugáHora. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  )
}