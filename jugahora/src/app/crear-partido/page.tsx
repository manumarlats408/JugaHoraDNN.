'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TimeSelector } from '@/components/ui/time-selector'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog'

type Club = {
  id: number
  name: string
}

type User = {
  id: number
  firstName: string
  lastName: string
}

export default function CrearPartidoJugador() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [players, setPlayers] = useState<User[]>([])
  const [selectedClubId, setSelectedClubId] = useState('')
  const [date, setDate] = useState<Date | null>(null)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [court, setCourt] = useState('')
  const [price, setPrice] = useState('')
  const [userId, setUserId] = useState<string | null>(null)  // ID del creador
  const [matchId, setMatchId] = useState<number | null>(null)  // Guardamos el matchId
  const [isModalOpen, setIsModalOpen] = useState(false)  // Estado del modal
  const router = useRouter()

  // Obtener clubes
  useEffect(() => {
    const fetchClubs = async () => {
      const res = await fetch('/api/clubs')
      const data = await res.json()
      setClubs(data)
    }
    fetchClubs()
  }, [])

  // Obtener jugadores disponibles
  useEffect(() => {
    const fetchPlayers = async () => {
      const res = await fetch('/api/users')  // Endpoint para obtener todos los usuarios
      const data = await res.json()
      setPlayers(data)
    }
    fetchPlayers()
  }, [])

  // Obtener userId del jugador autenticado
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth", { method: "GET", credentials: "include" })
        if (response.ok) {
          const data = await response.json()
          setUserId(data.entity.id) // Guardar el ID del usuario en el estado
        }
      } catch (error) {
        console.error("Error al obtener los datos del usuario:", error)
      }
    }
    fetchUserData()
  }, [])

  // Manejar la creación del partido
  const handleSubmit = async () => {
    if (!selectedClubId || !date || !startTime || !endTime || !court || !price || !userId) {
      alert('Por favor completá todos los campos')
      return
    }

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
        userId: userId, // Enviar el userId
      })
    })

    if (res.ok) {
      const createdMatch = await res.json(); // Aquí lo guardamos
      setMatchId(createdMatch.id)  // Guardar el ID del partido creado
      alert('Partido creado con éxito')
      router.push(`/add-players?matchId=${createdMatch.id}`) // Redirigimos con el ID del partido
    } else {
      alert('Error al crear el partido')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-green-50 to-white">
      <Card className="w-full max-w-xl shadow-md border-green-100">
        <CardHeader className="bg-green-50 border-b border-green-100">
          <CardTitle className="text-2xl font-bold text-green-800">
            Crear Partido
          </CardTitle>
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
            <Input value={court} onChange={(e) => setCourt(e.target.value)} className="w-full border rounded p-2" />
          </div>

          <div>
            <Label>Precio</Label>
            <Input
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))}
              className="w-full border rounded p-2"
            />
          </div>

          {/* Botón para abrir el modal de selección de jugadores */}
          <Button onClick={() => setIsModalOpen(true)}>Agregar Jugadores</Button>

          <div className="pt-4">
            <Button onClick={handleSubmit}>Crear Partido</Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de selección de jugadores */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seleccionar Jugadores</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {players.map((player) => (
              <div key={player.id} className="flex justify-between items-center border p-4 rounded-lg">
                <p>{player.firstName} {player.lastName}</p>
                <Button onClick={() => router.push(`/add-players?matchId=${matchId}`)}>
                  Añadir Jugadores
                </Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsModalOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
