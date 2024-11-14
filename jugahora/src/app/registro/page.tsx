'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { UserPlus, Loader2 } from 'lucide-react'
import Image from 'next/image'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"

export default function PaginaRegistro() {
  const [isClub, setIsClub] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [address, setAddress] = useState('')
  const [age, setAge] = useState<number | ''>('')
  const [clubName, setClubName] = useState('')
  const [error, setError] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const router = useRouter()

  const manejarEnvio = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsRegistering(true)

    try {
      const respuesta = await fetch('/api/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          isClub,
          email, 
          password, 
          firstName: isClub ? clubName : firstName, 
          lastName: isClub ? '' : lastName, 
          phoneNumber, 
          address, 
          age: isClub ? null : age 
        }),
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
    } finally {
      setIsRegistering(false)
    }
  }

  const RequiredFieldTooltip = () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <span className="text-red-500 ml-1">*</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Este campo es obligatorio</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

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
            <div className="flex items-center space-x-2">
              <Switch
                id="club-mode"
                checked={isClub}
                onCheckedChange={setIsClub}
              />
              <Label htmlFor="club-mode">Registrarse como club</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center">
                Correo electrónico <RequiredFieldTooltip />
              </Label>
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
              <Label htmlFor="password" className="flex items-center">
                Contraseña <RequiredFieldTooltip />
              </Label>
              <Input 
                id="password"
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {isClub ? (
              <div className="space-y-2">
                <Label htmlFor="clubName" className="flex items-center">
                  Nombre del Club <RequiredFieldTooltip />
                </Label>
                <Input 
                  id="clubName"
                  type="text" 
                  placeholder="Nombre del Club"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  required
                />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="flex items-center">
                      Nombre <RequiredFieldTooltip />
                    </Label>
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
                    <Label htmlFor="lastName" className="flex items-center">
                      Apellido <RequiredFieldTooltip />
                    </Label>
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
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="flex items-center">
                Número de teléfono <RequiredFieldTooltip />
              </Label>
              <Input 
                id="phoneNumber"
                type="tel"
                placeholder="+5491160381888"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center">
                Dirección {isClub && <RequiredFieldTooltip />}
              </Label>
              <Input 
                id="address"
                type="text"
                placeholder={isClub ? "Av. Siempreviva 123" : "Opcional: Av. Siempreviva 123"}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required={isClub}
              />
            </div>
            {error && <p className="text-red-500 text-center">{error}</p>}
            <Button type="submit" className="w-full" disabled={isRegistering}>
              {isRegistering ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" /> Registrarse
                </>
              )}
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