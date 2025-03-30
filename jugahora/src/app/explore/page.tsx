'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, ArrowLeft } from 'lucide-react'

interface User {
  id: number
  firstName: string
  lastName: string
  email: string
}

export default function ExploreProfiles() {
  const [profiles, setProfiles] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const router = useRouter()

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch('/api/users')
        const data = await response.json()
        setProfiles(data)
      } catch (error) {
        console.error('Error al cargar los perfiles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfiles()
  }, [])

  const handleSendRequest = async (friendId: number) => {
    try {
      const token = localStorage.getItem('token')

      const response = await fetch('/api/friends/send-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ friendId }),
      })

      const result = await response.json()
      alert(result.message)
    } catch (error) {
      console.error('Error al enviar solicitud:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-lg text-gray-600">Cargando perfiles...</p>
      </div>
    )
  }

  return (
    <main className="flex flex-col items-center min-h-screen p-4 bg-gradient-to-b from-green-50 to-white">
      <Card className="w-full max-w-2xl shadow-lg border-green-100 mb-6">
        <CardHeader className="bg-green-50 border-b border-green-100">
          <CardTitle className="text-2xl font-bold text-green-800 flex items-center">
            <UserPlus className="w-6 h-6 mr-2" />
            Explorar Perfiles
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600 text-sm">
              Conectate con otros jugadores. Podés enviar solicitudes de amistad y ver tu lista de amigos desde el perfil.
            </p>
            <Link
              href="/requests"
              className="text-sm text-green-600 hover:underline font-medium"
            >
              Ver Solicitudes
            </Link>
          </div>

          {profiles.length > 0 ? (
            profiles.map((profile) => (
              <div
                key={profile.id}
                className="flex justify-between items-center p-4 border border-gray-200 rounded-md bg-white shadow-sm"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    {profile.firstName} {profile.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{profile.email}</p>
                </div>
                <Button
                  onClick={() => handleSendRequest(profile.id)}
                  className="text-sm"
                >
                  Enviar Solicitud
                </Button>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No hay perfiles disponibles.</p>
          )}

          <Button
            onClick={() => router.push('/perfil')}
            variant="outline"
            className="mt-6 w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Perfil
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
