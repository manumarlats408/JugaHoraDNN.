'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TimeSelector } from '@/components/ui/time-selector'

type Club = {
  id: number
  name: string
}

export default function CrearPartidoJugador() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [selectedClubId, setSelectedClubId] = useState('')
  const [date, setDate] = useState<Date | null>(null)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [court, setCourt] = useState('')
  const [price, setPrice] = useState('')
  const [userId, setUserId] = useState<string | null>(null)  // ID del creador
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([])  // Jugadores seleccionados
  const router = useRouter()

  useEffect(() => {
    // Recuperar los jugadores seleccionados desde sessionStorage
    const storedPlayers = sessionStorage.getItem('finalPlayers')
    if (storedPlayers) {
      setSelectedPlayers(JSON.parse(storedPlayers))
    }

    const fetchClubs = async () => {
      const res = await fetch('/api/clubs')
      const data = await res.json()
      setClubs(data)
    }
    fetchClubs()

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
    fetchUserData()
  }, [])

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
        userId: userId,
        players: selectedPlayers  // Enviar jugadores seleccionados
      })
    })

    if (res.ok) {
      alert('Partido creado con éxito')
      router.push('/jugar')
    } else {
      alert('Error al crear el partido')
    }
  }

  const handleAddPlayersRedirect = () => {
    router.push('/add-players')  // Redirigir a la página de añadir jugadores
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

          {/* Botón para redirigir a la página de añadir jugadores */}
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
    </div>
  )
}
