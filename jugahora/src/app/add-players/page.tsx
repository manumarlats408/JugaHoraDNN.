'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MdArrowBack } from 'react-icons/md' // Importa el ícono de react-icons

interface User {
  id: number
  firstName: string
  lastName: string
}

const AddPlayers = () => {
  const [profiles, setProfiles] = useState<User[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]) // Guardamos los IDs de los jugadores seleccionados
  const router = useRouter()

  // Obtener los perfiles de usuarios
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

    // Recuperar los jugadores seleccionados desde sessionStorage
    const storedPlayers = sessionStorage.getItem('finalPlayers')
    if (storedPlayers) {
      setSelectedPlayers(JSON.parse(storedPlayers))
    }
  }, [])

  // Manejar la búsqueda de jugadores
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase()
    setSearchTerm(value)

    const filtered = profiles.filter((profile) =>
      `${profile.firstName} ${profile.lastName}`.toLowerCase().includes(value)
    )

    setFilteredProfiles(filtered)
  }

  // Manejar la selección de jugadores
  const handleAddPlayer = (playerId: number) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter((id) => id !== playerId))
    } else {
      setSelectedPlayers([...selectedPlayers, playerId])
    }
  }

  // Guardar jugadores seleccionados antes de volver al formulario
  const handleBack = () => {
    sessionStorage.setItem('finalPlayers', JSON.stringify(selectedPlayers))
    router.push('/crear-partido') // Redirige al formulario de creación
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="shadow-md border-green-100">
          <CardHeader className="bg-green-50 border-b border-green-100">
            <CardTitle className="text-xl font-bold text-green-800">Añadir Jugadores al Partido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {/* Flecha para regresar al formulario */}
            <Button
              onClick={handleBack}
              variant="outline"
              className="flex items-center justify-start gap-2 text-green-800"
            >
              <MdArrowBack className="h-5 w-5" />
              Volver
            </Button>
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

        <Button onClick={handleBack} className="w-full mt-6">
          Guardar y Volver
        </Button>
      </div>
    </div>
  )
}

export default AddPlayers
