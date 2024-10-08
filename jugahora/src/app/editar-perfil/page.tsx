'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, ArrowLeft } from 'lucide-react'
import Image from 'next/image'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string
  address?: string
  age?: number
}

export default function EditarPerfilPage() {
  const [userData, setUserData] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/auth', {
          method: 'GET',
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          setUserData(data.user)
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Error al obtener el perfil del usuario:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Enviando solicitud PUT'); // Agrega este log para verificar que se llame

    if (!userData) return;

    try {
        const response = await fetch('/api/user', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
            credentials: 'include',
        });

        if (response.ok) {
            router.push('/perfil');
        } else {
            console.error('Error al actualizar el perfil');
        }
    } catch (error) {
        console.error('Error al actualizar el perfil:', error);
    }
};


  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-lg text-gray-600">Cargando perfil...</p>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-lg text-gray-600">No se pudo cargar el perfil.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-white shadow-md">
        <Link className="flex items-center justify-center" href="/menu">
          <Image src='/logo.svg' alt="JugáHora Logo" width={32} height={32} />
          <span className="ml-2 text-2xl font-bold">JugáHora</span>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center p-4 bg-gradient-to-b from-green-50 to-white">
        <Card className="w-full max-w-lg shadow-lg border-green-100">
          <CardHeader className="bg-green-50 border-b border-green-100">
            <CardTitle className="text-2xl font-bold text-green-800 flex items-center">
              <User className="w-6 h-6 mr-2" />
              Editar Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  value={userData.firstName}
                  onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  value={userData.lastName}
                  onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Teléfono</Label>
                <Input
                  id="phoneNumber"
                  value={userData.phoneNumber || ''}
                  onChange={(e) => setUserData({ ...userData, phoneNumber: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={userData.address || ''}
                  onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="age">Edad</Label>
                <Input
                  id="age"
                  type="number"
                  value={userData.age || ''}
                  onChange={(e) => setUserData({ ...userData, age: parseInt(e.target.value) || undefined })}
                />
              </div>
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => router.push('/perfil')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                  Guardar cambios
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

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