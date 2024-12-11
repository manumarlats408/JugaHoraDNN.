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
  const [nivel, setNivel] = useState('') // Estado para el nivel
  const [currentStep, setCurrentStep] = useState(1) // Estado para el paso actual
  const [error, setError] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const router = useRouter()

  // New state for player preferences
  const [preferredSide, setPreferredSide] = useState('')
  const [strengths, setStrengths] = useState('')
  const [weaknesses, setWeaknesses] = useState('')

  const manejarEnvio = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsRegistering(true)

    try {
      if (currentStep === 1) {
        // Enviar los datos iniciales del usuario
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
            age: isClub ? null : age,
          }),
        })

        if (respuesta.ok) {
          setCurrentStep(2) // Pasar al segundo paso (preferencias del jugador)
        } else {
          const datos = await respuesta.json()
          setError(datos.error || 'Ocurrió un error durante el registro')
        }
      } else if (currentStep === 2) {
        // Pasar al tercer paso (nivel)
        setCurrentStep(3)
      } else {
        // Enviar el nivel del usuario y las preferencias
        const respuesta = await fetch('/api/registro', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, nivel, preferredSide, strengths, weaknesses }),
        })

        if (respuesta.ok) {
          router.push('/login') // Redirigir al login después del registro
        } else {
          const datos = await respuesta.json()
          setError(datos.error || 'Ocurrió un error al completar el registro')
        }
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
          <CardTitle className="text-2xl font-bold text-center">
            {currentStep === 1 ? 'Crear una cuenta' : 
             currentStep === 2 ? 'Preferencias de juego' : 
             'Selecciona tu nivel'}
          </CardTitle>
          <p className="text-center text-gray-500">
            {currentStep === 1
              ? 'Ingresa tus datos para registrarte'
              : currentStep === 2
              ? 'Cuéntanos sobre tu estilo de juego'
              : 'A continuación, selecciona tu nivel'}
          </p>
        </CardHeader>
        <CardContent>
          {currentStep === 1 ? (
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
                    <UserPlus className="mr-2 h-4 w-4" /> Siguiente
                  </>
                )}
              </Button>
            </form>
          ) : currentStep === 2 ? (
            <form onSubmit={manejarEnvio} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="preferredSide">Lado preferido de la cancha</Label>
                <select
                  id="preferredSide"
                  value={preferredSide}
                  onChange={(e) => setPreferredSide(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Selecciona un lado</option>
                  <option value="Izquierdo">Izquierdo</option>
                  <option value="Derecho">Derecho</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="strengths">Fortalezas (separa con comas)</Label>
                <Input
                  id="strengths"
                  type="text"
                  placeholder="Ej: Saque, Volea, Smash"
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weaknesses">Debilidades (separa con comas)</Label>
                <Input
                  id="weaknesses"
                  type="text"
                  placeholder="Ej: Revés, Globo, Defensa"
                  value={weaknesses}
                  onChange={(e) => setWeaknesses(e.target.value)}
                />
              </div>
              {error && <p className="text-red-500 text-center">{error}</p>}
              <Button type="submit" className="w-full" disabled={isRegistering}>
                {isRegistering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>Siguiente</>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={manejarEnvio} className="space-y-4">
              <p className="text-gray-500">
                A continuación, selecciona el nivel que mejor describe tu experiencia:
              </p>
              <ul className="list-disc pl-5 text-gray-700 space-y-2">
                <li><strong>Nivel 9 (Principiante):</strong> Maneja golpes básicos con poca precisión y control, especialmente en situaciones de juego lento. Suelen preferir los golpes de derecha y están empezando a entender el posicionamiento en la cancha.</li>
                <li><strong>Nivel 8 (Principiante):</strong> Tiene algo de experiencia y ha comenzado a desarrollar habilidades básicas. Se enfoca en mejorar la consistencia de sus golpes, controlar mejor la pelota, y manejar su posicionamiento en la cancha con mayor efectividad.</li>
                <li><strong>Nivel 7 (Principiante Intermedio):</strong> Posee técnica refinada para ejecutar todos los golpes con consistencia. Tiene buen control y adaptabilidad en la cancha, logrando manejar la velocidad media de la pelota, aunque puede tener dificultades con golpes rápidos.</li>
                <li><strong>Nivel 6 (Intermedio):</strong> Maneja golpes con velocidad y juego constante. Además, muestra habilidad para variar la estrategia en el juego y para identificar los puntos débiles del oponente.</li>
                <li><strong>Nivel 5 (Intermedio):</strong> Combina una técnica excelente con una comprensión táctica del juego. Se adapta rápidamente a diferentes estilos y estrategias, explotando las debilidades del rival con efectividad y manejando con confianza la velocidad alta de la pelota.</li>
                <li><strong>Nivel 4 (Avanzado):</strong> Alto nivel de competitividad y dominio completo de la técnica, así como una comprensión táctica avanzada. Puede variar constantemente las estrategias, anticiparse a las jugadas del rival y controlar tanto la velocidad como la dirección de la pelota con precisión.</li>
                <li><strong>Nivel 3 (Avanzado):</strong> Control excepcional de la pelota, ejecutando golpes complejos como bandejas y víboras con consistencia. El uso estratégico de las paredes y los ángulos forma parte integral de su juego, permitiéndole construir puntos elaborados.</li>
                <li><strong>Niveles 2 y 1 (Profesional):</strong> En estas categorías, los jugadores suelen dedicarse de manera profesional al padel, aunque el nivel de profesionalización puede variar entre ambas categorías. Tienen un dominio avanzado y juegan con gran habilidad y experiencia.</li>
              </ul>
              <div className="space-y-2">
                <Label htmlFor="nivel">Selecciona tu nivel</Label>
                <Input
                  id="nivel"
                  type="text"
                  placeholder="Ejemplo: Nivel 4"
                  value={nivel}
                  onChange={(e) => setNivel(e.target.value)}
                  required
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
                  <>Finalizar Registro</>
                )}
              </Button>
            </form>
          )}
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

