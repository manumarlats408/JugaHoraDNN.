'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter, useSearchParams } from 'next/navigation'  // Asegúrate de importar useSearchParams
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface User {
  id: number
  firstName: string
  lastName: string
  email: string
}

export default function AddPlayers() {
  const [profiles, setProfiles] = useState<User[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]) // Guardamos los IDs de los jugadores seleccionados
  const router = useRouter()
  const searchParams = useSearchParams()  // Aquí obtenemos los parámetros de la URL
  const matchId = searchParams.get('matchId')  // Obtenemos el matchId de la query string

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/users') // Obtener todos los usuarios
        const users = await res.json()
        setProfiles(users)
        setFilteredProfiles(users)
      } catch (error) {
        console.error('Error al cargar datos:', error)
      }
    }

    fetchData()
  }, [])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase()
    setSearchTerm(value)

    const filtered = profiles.filter((profile) =>
      `${profile.firstName} ${profile.lastName}`.toLowerCase().includes(value)
    )

    setFilteredProfiles(filtered)
  }

  const handleAddPlayer = (playerId: number) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter((id) => id !== playerId)) // Eliminar si ya está seleccionado
    } else {
      setSelectedPlayers([...selectedPlayers, playerId]) // Añadir jugador
    }
  }

  const handleSubmit = async () => {
    if (!matchId || selectedPlayers.length === 0) {
      alert('Por favor, selecciona al menos un jugador')
      return
    }

    // Enviar los jugadores seleccionados al partido
    const res = await fetch(`/api/matches/${matchId}/add-players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerIds: selectedPlayers })
    })

    if (res.ok) {
      alert('Jugadores añadidos al partido')
      router.push('/jugar') // Redirigir a la página de partidos
    } else {
      alert('Error al añadir jugadores')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="shadow-md border-green-100">
          <CardHeader className="bg-green-50 border-b border-green-100">
            <CardTitle className="text-xl font-bold text-green-800">Añadir Jugadores al Partido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full"
            />

            {filteredProfiles.length > 0 ? (
              <div className="space-y-4">
                {filteredProfiles.map((profile) => (
                  <div key={profile.id} className="flex justify-between items-center border p-4 rounded-lg hover:bg-green-50 transition-colors">
                    <div>
                      <p className="text-lg font-semibold text-gray-800">{profile.firstName} {profile.lastName}</p>
                      <p className="text-sm text-gray-500">{profile.email}</p>
                    </div>
                    <Button
                      onClick={() => handleAddPlayer(profile.id)}
                      className={`text-sm ${selectedPlayers.includes(profile.id) ? 'bg-green-600' : 'bg-gray-200'}`}
                    >
                      {selectedPlayers.includes(profile.id) ? 'Añadido' : 'Añadir al partido'}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No se encontraron perfiles.</p>
            )}
          </CardContent>
        </Card>

        <Button onClick={handleSubmit} className="w-full mt-6">
          Añadir Jugadores al Partido
        </Button>
      </div>
    </div>
  )
}
