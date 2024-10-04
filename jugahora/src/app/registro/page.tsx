'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { UserPlus } from 'lucide-react'
import Image from 'next/image'


export default function PaginaRegistro() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')  // Nuevo campo
  const [address, setAddress] = useState('')  // Nuevo campo
  const [age, setAge] = useState<number | ''>('')  // Nuevo campo
  const [error, setError] = useState('')
  const router = useRouter()

  const manejarEnvio = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    try {
      const respuesta = await fetch('/api/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, firstName, lastName, phoneNumber, address, age }),  // Incluye los nuevos campos
      })

      if (respuesta.ok) {
        router.push('/login')
      } else {
        const datos = await respuesta.json()
        setError(datos.error || 'Ocurrió un error durante el registro')
      }
    } catch (error) {
      console.error('Error de registro:', error)
      setError('Ocurrió un error inesperado. Por favor, intenta de nuevo.')
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
          <CardTitle className="text-2xl font-bold text-center">Crear una cuenta</CardTitle>
          <p className="text-center text-gray-500">Ingresa tus datos para registrarte</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={manejarEnvio} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input 
                id="email"
                type="email" 
                placeholder="tu@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password"
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input 
                  id="firstName"
                  type="text" 
                  placeholder="Juan"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input 
                  id="lastName"
                  type="text" 
                  placeholder="Pérez"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            {/* Nuevos campos añadidos */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Número de teléfono</Label>
              <Input 
                id="phoneNumber"
                type="tel"
                placeholder="Opcional: +54 9 1234 5678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input 
                id="address"
                type="text"
                placeholder="Opcional: Av. Siempreviva 123"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Edad</Label>
              <Input 
                id="age"
                type="number"
                placeholder="Opcional: 30"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
              />
            </div>
            {/* Fin de nuevos campos */}
            {error && <p className="text-red-500 text-center">{error}</p>}
            <Button type="submit" className="w-full">
              <UserPlus className="mr-2 h-4 w-4" /> Registrarse
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-sm text-gray-500 text-center">
            Al registrarte, aceptas nuestros 
            <Link href="/terminos" className="text-green-600 hover:underline"> términos de servicio</Link> y 
            <Link href="/privacidad" className="text-green-600 hover:underline"> política de privacidad</Link>.
          </p>
          <p className="text-sm text-gray-500 text-center">
            ¿Ya tienes una cuenta? 
            <Link href="/login" className="text-green-600 hover:underline"> Inicia sesión</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
