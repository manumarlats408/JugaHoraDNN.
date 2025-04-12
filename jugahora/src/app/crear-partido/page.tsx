'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TimeSelector } from '@/components/ui/time-selector'
import { Home, User, Calendar, Users, Trophy, LogOut } from 'lucide-react'

const elementosMenu = [
  { href: '/menu', etiqueta: 'Menú', icono: Home },
  { href: '/perfil', etiqueta: 'Perfil', icono: User },
  { href: '/reserva', etiqueta: 'Reservar', icono: Calendar },
  { href: '/jugar', etiqueta: 'Unirme a un partido', icono: Users },
  { href: '/eventos/unirse', etiqueta: 'Unirme a un evento', icono: Trophy },
]

type Club = {
  id: number
  name: string
}

type Match = {
  id: number
  date: string
  startTime: string
  endTime: string
  court: string
  players: number
  price: number
  clubId: number
  Club: {
    name: string
    address?: string
  }
}

export default function CrearPartidoJugador() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [selectedClubId, setSelectedClubId] = useState('')
  const [date, setDate] = useState<Date | null>(null)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [court, setCourt] = useState('')
  const [price, setPrice] = useState('')
  const [myMatches, setMyMatches] = useState<Match[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([])
  const router = useRouter()

  useEffect(() => {
    const storedPlayers = sessionStorage.getItem('finalPlayers')
    if (storedPlayers) {
      setSelectedPlayers(JSON.parse(storedPlayers))
    }

    const storedData = sessionStorage.getItem('formData')
    if (storedData) {
      const data = JSON.parse(storedData)
      setSelectedClubId(data.selectedClubId)
      setDate(data.date ? new Date(data.date) : null)
      setStartTime(data.startTime)
      setEndTime(data.endTime)
      setCourt(data.court)
      setPrice(data.price)
    }

    const fetchClubs = async () => {
      const res = await fetch('/api/clubs')
      const data = await res.json()
      setClubs(data)
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth", { method: "GET", credentials: "include" })
        if (response.ok) {
          const data = await response.json()
          setUserId(data.entity.id)
        }
      } catch (error) {
        console.error("Error al obtener los datos del usuario:", error)
      }
    }

    fetchClubs()
    fetchUserData()
  }, [])

  useEffect(() => {
    if (!userId) return
    const fetchMyMatches = async () => {
      const res = await fetch(`/api/matches?userId=${userId}`, { credentials: 'include' })
      const data = await res.json()
      setMyMatches(data)
    }
    fetchMyMatches()
  }, [userId])
  
  const guardarFormularioEnSession = () => {
    sessionStorage.setItem('formData', JSON.stringify({
      selectedClubId,
      date: date?.toISOString() || '',
      startTime,
      endTime,
      court,
      price
    }))
  }

  const handleSubmit = async () => {
    if (!selectedClubId || !date || !startTime || !endTime || !court || !price || !userId) {
      alert('Por favor completá todos los campos')
      return
    }

    guardarFormularioEnSession()

    const res = await fetch('/api/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: date.toISOString(),
        startTime,
        endTime,
        court,
        price: parseFloat(price),
        clubId: parseInt(selectedClubId),
        userId,
        players: selectedPlayers
      })
    })

    if (res.ok) {
      alert('Partido creado con éxito')
      sessionStorage.removeItem('formData')
      sessionStorage.removeItem('finalPlayers')
      router.push('/jugar')
    } else {
      alert('Error al crear el partido')
    }
  }

  const handleAddPlayersRedirect = () => {
    if (!selectedClubId || !date || !startTime || !endTime || !court || !price) {
      alert('Por favor completá todos los campos antes de añadir jugadores')
      return
    }

    guardarFormularioEnSession()
    router.push('/add-players')
  }

  const manejarCierreSesion = async () => {
    try {
      await fetch('/api/logout', { method: 'GET', credentials: 'include' })
      router.push('/')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* TOPBAR */}
      <header className="px-4 lg:px-6 h-16 flex items-center relative bg-white shadow-md">
        <Link className="flex items-center justify-center" href="/menu">
          <Image src='/logo.svg' alt="Logo" width={32} height={32} />
          <span className="ml-2 text-2xl font-bold">JugáHora</span>
        </Link>
        <nav className="hidden lg:flex ml-auto gap-6">
          {elementosMenu.map((el) => (
            <Link
              key={el.href}
              href={el.href}
              className="flex items-center text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
            >
              <el.icono className="w-4 h-4 mr-2" />
              {el.etiqueta}
            </Link>
          ))}
          <button
            className="flex items-center text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
            onClick={manejarCierreSesion}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </button>
        </nav>
      </header>

      {/* FORMULARIO */}
      <main className="flex-1 p-4 bg-gradient-to-b from-green-50 to-white">
        <Card className="w-full max-w-xl mx-auto shadow-md border-green-100">
          <CardHeader className="bg-green-50 border-b border-green-100">
            <CardTitle className="text-2xl font-bold text-green-800">Crear Partido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 mt-4">
            <div>
              <Label>Club</Label>
              <select
                value={selectedClubId}
                onChange={(e) => setSelectedClubId(e.target.value)}
                className="w-full border rounded p-2"
              >
                <option value="">Seleccioná un club</option>
                {clubs.map(club => (
                  <option key={club.id} value={club.id}>{club.name}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Fecha</Label>
              <Input
                type="date"
                value={date ? date.toISOString().split('T')[0] : ''}
                onChange={(e) => setDate(new Date(e.target.value))}
                className="w-full border rounded p-2"
              />
            </div>

            <div>
              <Label>Hora de Inicio</Label>
              <TimeSelector id="startTime" value={startTime} onChange={setStartTime} />
            </div>

            <div>
              <Label>Hora de Fin</Label>
              <TimeSelector id="endTime" value={endTime} onChange={setEndTime} />
            </div>

            <div>
              <Label>Cancha</Label>
              <Input
                value={court}
                onChange={(e) => setCourt(e.target.value)}
                placeholder="Ej: 5"
                className="w-full border rounded p-2"
              />
            </div>

            <div>
              <Label>Precio</Label>
              <Input
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))}
                placeholder="Ej: 44000"
                className="w-full border rounded p-2"
              />
            </div>

            <Button onClick={handleAddPlayersRedirect} className="w-full mt-4">
              Añadir Jugadores
            </Button>

            <div className="pt-4">
              <Button onClick={handleSubmit} className="w-full">
                Crear Partido
              </Button>
            </div>
          </CardContent>
        </Card>
        {myMatches.length > 0 && (
          <div className="max-w-xl mx-auto mt-8 space-y-4">
            <h2 className="text-xl font-semibold text-green-800">Mis partidos creados</h2>
            {myMatches.map((match) => (
              <Card key={match.id} className="p-4 border border-green-100">
                <p><strong>Fecha:</strong> {match.date.split('T')[0]}</p>
                <p><strong>Hora:</strong> {match.startTime} - {match.endTime}</p>
                <p><strong>Cancha:</strong> {match.court}</p>
                <p><strong>Jugadores:</strong> {match.players}/4</p>
                <p><strong>Precio:</strong> ${match.price}</p>
                <div className="mt-2 flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/editar-partido/${match.id}`)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      const confirm = window.confirm("¿Seguro que querés cancelar el partido?")
                      if (!confirm) return

                      const res = await fetch(`/api/matches/${match.id}`, { method: "DELETE" })
                      if (res.ok) {
                        setMyMatches(prev => prev.filter(p => p.id !== match.id))
                      } else {
                        alert("Error al eliminar el partido")
                      }
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="py-6 px-4 md:px-6 bg-white border-t border-gray-200">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-gray-500 mb-2 sm:mb-0">
            © 2024 JugáHora. Todos los derechos reservados.
          </p>
          <nav className="flex gap-4">
            <Link className="text-xs text-gray-500 hover:text-green-600 transition-colors" href="/terminos">
              Términos de Servicio
            </Link>
            <Link className="text-xs text-gray-500 hover:text-green-600 transition-colors" href="/privacidad">
              Privacidad
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
