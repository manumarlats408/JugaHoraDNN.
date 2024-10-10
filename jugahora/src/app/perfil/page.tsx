'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { User, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface UserData {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string
  address?: string
  age?: number
}

export default function EditarPerfilPage() {
  const [userData, setUserData] = useState<UserData>({
    id: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    age: undefined,
  })
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUserData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsSaving(true)

    try {
      const response = await fetch('/api/actualizar-perfil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        router.push('/perfil')
      } else {
        const data = await response.json()
        setError(data.error || 'Ocurrió un error al actualizar el perfil')
      }
    } catch (error) {
      console.error('Error al actualizar el perfil:', error)
      setError('Ocurrió un error inesperado. Por favor, intenta de nuevo.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-100 p-4">
      <Link href="/" className="mb-8 text-2xl font-bold flex items-center">
        <Image src='/logo.svg' alt="JugáHora Logo" width={32} height={32} /> 
        JugáHora
      </Link>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Editar Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input 
                id="email"
                name="email"
                type="email" 
                value={userData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre</Label>
              <Input 
                id="firstName"
                name="firstName"
                type="text" 
                value={userData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <Input 
                id="lastName"
                name="lastName"
                type="text" 
                value={userData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Número de teléfono</Label>
              <Input 
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={userData.phoneNumber}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input 
                id="address"
                name="address"
                type="text"
                value={userData.address}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Edad</Label>
              <Input 
                id="age"
                name="age"
                type="number"
                value={userData.age || ''}
                onChange={handleInputChange}
              />
            </div>
            {error && <p className="text-red-500 text-center">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando cambios...
                </>
              ) : (
                <>
                  <User className="mr-2 h-4 w-4" /> Guardar cambios
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}