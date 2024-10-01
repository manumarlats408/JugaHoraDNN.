'use client'

import { useRouter } from 'next/navigation'
import { useState, FormEvent } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('') // Estado para manejar el error
  const router = useRouter()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault() // Evita el comportamiento predeterminado del formulario

    // Verificación de credenciales
    if (email === 'manumarlats@gmail.com' && password === 'manu.2003') {
      // Redirige a '/menu' si las credenciales son correctas
      router.push('/menu')
    } else {
      // Muestra un mensaje de error si las credenciales son incorrectas
      setError('Correo electrónico o contraseña incorrectos')
      console.error('Error de inicio de sesión: Correo o contraseña incorrectos')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">JugáHora</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}> {/* Llama a handleSubmit al enviar el formulario */}
            <div className="space-y-4">
              <Input 
                type="email" 
                placeholder="Ingresa tu correo electrónico" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input 
                type="password" 
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && <p className="text-red-500">{error}</p>} {/* Muestra el mensaje de error si existe */}
              <Button type="submit" className="w-full">SIGUIENTE</Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          {/* Se eliminó el botón de Google */}
        </CardFooter>
      </Card>
    </div>
  )
}

