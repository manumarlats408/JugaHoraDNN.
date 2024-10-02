'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { UserPlus } from 'lucide-react'

export default function PaginaRegistro() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
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
        body: JSON.stringify({ email, password, firstName, lastName }),
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
      <Link href="/" className="mb-8 text-2xl font-bold text-green-600 flex items-center">
        <span className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white mr-2">JH</span>
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
