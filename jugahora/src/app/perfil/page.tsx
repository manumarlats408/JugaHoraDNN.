'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Menu, X, Home, User, Calendar, Users, LogOut, Mail, Phone, MapPin, Clock, Plus } from 'lucide-react'
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

interface Partido {
  id: number
  fecha: string
  jugadores: string
  resultado: string
}

const menuItems = [
  { href: '/menu', label: 'Menu', icon: Home },
  { href: '/perfil', label: 'Perfil', icon: User },
  { href: '/reserva', label: 'Reservar', icon: Calendar },
  { href: '/jugar', label: 'Unirme a un partido', icon: Users },
]

export default function PerfilPage() {
  const [userData, setUserData] = useState<User | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [partidos, setPartidos] = useState<Partido[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [fecha, setFecha] = useState('')
  const [jugadores, setJugadores] = useState(['', '', '', ''])
  const [numSets, setNumSets] = useState('2')
  const [resultados, setResultados] = useState(['', '', ''])
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const authResponse = await fetch('/api/auth', {
          method: 'GET',
          credentials: 'include',
        })

        if (authResponse.ok) {
          const userData = await authResponse.json()
          setUserData(userData.user)

          // Obtener los partidos del usuario
          const partidosResponse = await fetch(`/api/partidos?userId=${userData.user.id}`, {
            method: 'GET',
            credentials: 'include',
          })

          if (partidosResponse.ok) {
            const partidosData = await partidosResponse.json()
            setPartidos(partidosData)
          } else {
            console.error('Error al obtener los partidos del usuario')
          }
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Error al obtener el perfil del usuario:', error)
        router.push('/login')
      }
    }

    fetchUserProfile()

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'GET',
        credentials: 'include',
      })
      router.push('/')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const handleAddPartido = async () => {
    const resultado = resultados.slice(0, parseInt(numSets)).join(' - ')
    const partidoData = {
      userId: userData?.id,
      fecha,
      jugadores: jugadores.join(', '),
      resultado
    }

    try {
      const response = await fetch('/api/partidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(partidoData),
      })

      if (response.ok) {
        const newPartido = await response.json()
        setPartidos([newPartido, ...partidos])
        // Limpiar el formulario
        setFecha('')
        setJugadores(['', '', '', ''])
        setNumSets('2')
        setResultados(['', '', ''])
        setIsDialogOpen(false)
      } else {
        console.error('Error al añadir el partido')
      }
    } catch (error) {
      console.error('Error al añadir el partido:', error)
    }
  }

  if (!userData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-lg text-gray-600">Cargando perfil...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="px-4 lg:px-6 h-16 flex items-center relative bg-white shadow-md">
        <Link className="flex items-center justify-center" href="/menu">
          <span className="sr-only">JugáHora</span>
          <Image src='/logo.svg' alt="JugáHora Logo" width={32} height={32} />
          <span className="ml-2 text-2xl font-bold">JugáHora</span>
        </Link>

        <nav className="hidden lg:flex ml-auto gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              className="flex items-center text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
              href={item.href}
            >
              <item.icon className="w-4 h-4 mr-2" />
              {item.label}
            </Link>
          ))}
          <button
            className="flex items-center text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </button>
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden ml-auto text-gray-600 hover:text-green-600"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </header>

      {isMenuOpen && (
        <div
          ref={menuRef}
          className="lg:hidden absolute top-16 right-0 left-0 bg-white shadow-md z-10 transition-all duration-300 ease-in-out"
        >
          <nav className="py-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </Link>
            ))}
            <button 
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </button>
          </nav>
        </div>
      )}

      <main className="flex-1 flex flex-col items-center p-4 bg-gradient-to-b from-green-50 to-white">
        <Card className="w-full max-w-lg shadow-lg border-green-100 mb-6">
          <CardHeader className="bg-green-50 border-b border-green-100">
            <CardTitle className="text-2xl font-bold text-green-800 flex items-center">
              <User className="w-6 h-6 mr-2" />
              Perfil de {userData.firstName}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center">
              <Mail className="w-5 h-5 mr-2 text-gray-500" />
              <p><strong>Email:</strong> {userData.email}</p>
            </div>
            <div className="flex items-center">
              <User className="w-5 h-5 mr-2 text-gray-500" />
              <p><strong>Nombre completo:</strong> {userData.firstName} {userData.lastName}</p>
            </div>
            {userData.phoneNumber && (
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-2 text-gray-500" />
                <p><strong>Teléfono:</strong> {userData.phoneNumber}</p>
              </div>
            )}
            {userData.address && (
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-gray-500" />
                <p><strong>Dirección:</strong> {userData.address}</p>
              </div>
            )}
            {userData.age && (
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-gray-500" />
                <p><strong>Edad:</strong> {userData.age}</p>
              </div>
            )}
            <Button
              className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white transition-colors duration-300"
              onClick={() => router.push('/editar-perfil')}
            >
              Editar perfil
            </Button>
          </CardContent>
        </Card>

        <Card className="w-full max-w-lg shadow-lg border-green-100">
          <CardHeader className="bg-green-50 border-b border-green-100">
            <CardTitle className="text-2xl font-bold text-green-800 flex items-center justify-between">
              <span>Historial de Partidos</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {partidos.length > 0 ? (
              partidos.map((partido) => (
                <div key={partido.id} className="border-b border-gray-200 pb-2">
                  <p><strong>Fecha:</strong> {new Date(partido.fecha).toLocaleDateString()}</p>
                  <p><strong>Jugadores:</strong> {partido.jugadores}</p>
                  <p><strong>Resultado:</strong> {partido.resultado}</p>
                </div>
              ))
            ) : (
              <p>No hay partidos registrados aún.</p>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Añadir Nuevo Partido"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="fecha">Fecha</Label>
            <Input
              id="fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>
          {jugadores.map((jugador, index) => (
            <div key={index}>
              <Label htmlFor={`jugador${index + 1}`}>Jugador {index + 1}</Label>
              <Input
                id={`jugador${index + 1}`}
                value={jugador}
                onChange={(e) => {
                  const newJugadores = [...jugadores]
                  newJugadores[index] = e.target.value
                  setJugadores(newJugadores)
                }}
                placeholder={index === 0 ? userData.firstName : `Jugador ${index + 1}`}
              />
            </div>
          ))}
          <div>
            <Label htmlFor="numSets">Número de Sets</Label>
            <Select value={numSets} onValueChange={setNumSets}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar número de sets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 Sets</SelectItem>
                <SelectItem value="3">3 Sets</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {resultados.slice(0, parseInt(numSets)).map((resultado, index) => (
            <div key={index}>
              <Label htmlFor={`resultado${index + 1}`}>Resultado Set {index + 1}</Label>
              <Input
                id={`resultado${index + 1}`}
                value={resultado}
                onChange={(e) => {
                  const newResultados = [...resultados]
                  newResultados[index] = e.target.value
                  setResultados(newResultados)
                }}
                placeholder="6-4"
              />
            </div>
          ))}
          <Button onClick={handleAddPartido} className="w-full">Añadir Partido</Button>
        </div>
      </Dialog>

      <footer className="py-6 px-4 md:px-6 bg-white border-t border-gray-200">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-gray-500 mb-2 sm:mb-0">
            © 2024 JugáHora. Todos los derechos reservados.
          </p>
          <nav className="flex gap-4">
            <Link className="text-xs text-gray-500 hover:text-green-600 transition-colors" href="/perfil">
              Términos de Servicio
            </Link>
            <Link className="text-xs text-gray-500 hover:text-green-600 transition-colors" href="/perfil">
              Privacidad
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}