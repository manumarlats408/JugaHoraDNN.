'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function PaginaRegistro() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const manejarEnvio = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('') // Limpiar errores previos

    try {
      const respuesta = await fetch('/api/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, firstName, lastName }),
      })

      if (respuesta.ok) {
        // Registro exitoso, redirigir a la página de inicio de sesión o menú
        router.push('/login')
      } else {
        // Registro fallido
        const datos = await respuesta.json()
        setError(datos.error || 'Ocurrió un error durante el registro')
      }
    } catch (error) {
      console.error('Error de registro:', error)
      setError('Ocurrió un error inesperado. Por favor, intenta de nuevo.')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Registrarse en JugáHora</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={manejarEnvio}>
            <div className="space-y-4">
              <Input 
                type="email" 
                placeholder="Ingresa tu correo electrónico" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input 
                type="password" 
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Input 
                type="text" 
                placeholder="Nombre"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <Input 
                type="text" 
                placeholder="Apellido"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
              {error && <p className="text-red-500">{error}</p>}
              <Button type="submit" className="w-full">REGISTRARSE</Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          {/* Contenido adicional del pie de página si es necesario */}
        </CardFooter>
      </Card>
    </div>
  )
}
