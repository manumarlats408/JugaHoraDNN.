'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Menu, X, Home, User, Calendar, Users, LogOut, Clock, MapPin, Hash, Search, DollarSign } from 'lucide-react'
import { toast } from 'react-hot-toast'

type Match = {
  id: number
  date: string
  startTime: string
  endTime: string  
  court: string
  players: number
  maxPlayers: number
  nombreClub: string
  price: number
  direccionClub: string
  userJoined: boolean
}

type User = {
  id: number
  email: string
  firstName?: string
  lastName?: string
  name?: string
  partidosUnidos: number[]
}

const elementosMenu = [
  { href: '/menu', etiqueta: 'Menú', icono: Home },
  { href: '/perfil', etiqueta: 'Perfil', icono: User },
  { href: '/reserva', etiqueta: 'Reservar', icono: Calendar },
  { href: '/jugar', etiqueta: 'Unirme a un partido', icono: Users },
]

export default function PaginaJuega() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [matches, setMatches] = useState<Match[]>([])
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [priceFilter, setPriceFilter] = useState<number>(0)
  const [minPrice, setMinPrice] = useState<number>(0)
  const [maxPrice, setMaxPrice] = useState<number>(100)
  const [loadingMatches, setLoadingMatches] = useState<{ [key: number]: boolean }>({});
  const referenciaMenu = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const alternarMenu = () => setMenuAbierto(!menuAbierto)

  useEffect(() => {
    const fetchUserAndMatches = async () => {
      try {
        setIsLoading(true)
        const authResponse = await fetch('/api/auth', {
          method: 'GET',
          credentials: 'include',
        })

        if (authResponse.ok) {
          const userData = await authResponse.json()
          setUser(userData.entity)

          const matchesResponse = await fetch('/api/matches', {
            method: 'GET',
            credentials: 'include',
          })

          if (matchesResponse.ok) {
            const matchesData = await matchesResponse.json()
            const matchesWithUserJoined = matchesData.map((match: Match) => ({
              ...match,
              userJoined: userData.entity.partidosUnidos.includes(match.id)
            }))
            setMatches(matchesWithUserJoined)
            setFilteredMatches(matchesWithUserJoined)

            const prices = matchesWithUserJoined.map((match: Match) => match.price)
            setMinPrice(Math.min(...prices))
            setMaxPrice(Math.max(...prices))
            setPriceFilter(Math.max(...prices))
          } else {
            console.error('Error al obtener los partidos')
            toast.error('No se pudieron cargar los partidos')
          }
        } else {
          throw new Error('Failed to fetch user data')
        }
      } catch (error) {
        console.error('Error al obtener el perfil del usuario:', error)
        toast.error('Error de autenticación')
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserAndMatches()

    const manejarClicFuera = (evento: MouseEvent) => {
      if (referenciaMenu.current && !referenciaMenu.current.contains(evento.target as Node)) {
        setMenuAbierto(false)
      }
    }

    document.addEventListener('mousedown', manejarClicFuera)
    return () => {
      document.removeEventListener('mousedown', manejarClicFuera)
    }
  }, [router])

  useEffect(() => {
    const filtered = matches.filter(match => {
      const matchDate = new Date(match.date).toISOString().split('T')[0]
      const matchesSearch = match.nombreClub.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            match.direccionClub.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDate = dateFilter === '' || matchDate === dateFilter
      const matchesPrice = match.price <= priceFilter
      
      return matchesSearch && matchesDate && matchesPrice
    })
    setFilteredMatches(filtered)
  }, [matches, searchTerm, dateFilter, priceFilter])

  const manejarCierreSesion = async () => {
    try {
      await fetch('/api/logout', {
        method: 'GET',
        credentials: 'include',
      })
      router.push('/')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      toast.error('Error al cerrar sesión')
    }
  }

  const manejarUnirsePartido = async (idPartido: number) => {
    if (!user) {
      toast.error('Debes iniciar sesión para unirte a un partido')
      router.push('/login')
      return
    }

    setLoadingMatches(prev => ({ ...prev, [idPartido]: true }));

    try {
      const respuesta = await fetch(`/api/matches/${idPartido}/join`, {
        method: 'POST',
        credentials: 'include',
      })
      
      if (respuesta.ok) {
        const updatedMatch = await respuesta.json()
        setMatches(matches.map(match => 
          match.id === idPartido ? { ...match, players: updatedMatch.players, userJoined: true } : match
        ))
        setUser(prevUser => ({
          ...prevUser!,
          partidosUnidos: [...prevUser!.partidosUnidos, idPartido]
        }))
        toast.success('Te has unido al partido exitosamente!')
      } else {
        const errorData = await respuesta.json()
        if (respuesta.status === 401) {
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.')
          router.push('/login')
        } else {
          toast.error(errorData.error || 'Error al unirse al partido')
        }
      }
    } catch (error) {
      console.error('Error al conectar con la API para unirse al partido:', error)
      toast.error('Error al conectar con el servidor')
    } finally {
      setLoadingMatches(prev => ({ ...prev, [idPartido]: false }));
    }
  }

  const manejarRetirarse = async (idPartido: number) => {
    if (!user) {
      toast.error('Debes iniciar sesión para retirarte de un partido')
      router.push('/login')
      return
    }

    setLoadingMatches(prev => ({ ...prev, [idPartido]: true }));

    try {
      const match = matches.find(m => m.id === idPartido)
      if (!match) {
        throw new Error('Partido no encontrado')
      }

      const startTime = new Date(`${match.date}T${match.startTime}`)
      const now = new Date()
      const timeDiff = startTime.getTime() - now.getTime()
      const hoursDiff = timeDiff / (1000 * 60 * 60)

      if (hoursDiff <= 1.5) {
        toast.error('No puedes retirarte menos de 1 hora y media antes del inicio del partido')
        return
      }

      const respuesta = await fetch(`/api/matches/${idPartido}/leave`, {
        method: 'POST',
        credentials: 'include',
      })
      
      if (respuesta.ok) {
        const updatedMatch = await respuesta.json()
        setMatches(matches.map(match => 
          match.id === idPartido ? { ...match, players: updatedMatch.players, userJoined: false } : match
        ))
        setUser(prevUser => ({
          ...prevUser!,
          partidosUnidos: prevUser!.partidosUnidos.filter(id => id !== idPartido)
        }))
        toast.success('Te has retirado del partido exitosamente!')
      } else {
        const errorData = await respuesta.json()
        if (respuesta.status === 401) {
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.')
          router.push('/login')
        } else {
          toast.error(errorData.error || 'Error al retirarse del partido')
        }
      }
    } catch (error) {
      console.error('Error al conectar con la API para retirarse del partido:', error)
      toast.error('Error al conectar con el servidor')
    } finally {
      setLoadingMatches(prev => ({ ...prev, [idPartido]: false }));
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-lg text-gray-600">Cargando partidos...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-lg text-gray-600">No se pudo cargar la información del usuario. Por favor, inténtalo de nuevo.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="px-4 lg:px-6 h-16 flex items-center relative bg-white shadow-md">
        <Link className="flex items-center justify-center" href="/menu">
          <span className="sr-only">JugáHora</span>
          <Image src='/logo.svg' alt="Logo de JugáHora" width={32} height={32} /> 
          <span className="ml-2 text-2xl font-bold">JugáHora</span>
        </Link>

        <nav className="hidden lg:flex ml-auto gap-6">
          {elementosMenu.map((elemento) => (
            <Link
              key={elemento.href}
              className="flex items-center text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
              href={elemento.href}
            >
              <elemento.icono className="w-4 h-4 mr-2" />
              {elemento.etiqueta}
            </Link>
          ))}
          <button
            className="flex items-center text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
            onClick={manejarCierreSesion}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </button>
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden ml-auto text-gray-600 hover:text-green-600"
          onClick={alternarMenu}
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
        >
          {menuAbierto ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </header>

      {menuAbierto && (
        <div
          ref={referenciaMenu}
          className="lg:hidden absolute top-16 right-0 left-0 bg-white shadow-md z-10 transition-all duration-300 ease-in-out"
        >
          <nav className="py-2">
            {elementosMenu.map((elemento) => (
              <Link
                key={elemento.href}
                href={elemento.href}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setMenuAbierto(false)}
              >
                <elemento.icono className="w-4 h-4 mr-2" />
                {elemento.etiqueta}
              </Link>
            ))}
            <button 
              onClick={manejarCierreSesion}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </button>
          </nav>
        </div>
      )}

      <main className="flex-1 p-4 bg-gradient-to-b from-green-50 to-white">
        <Card className="w-full max-w-4xl mx-auto shadow-lg border-green-100">
          <CardHeader className="bg-green-50 border-b border-green-100">
            <CardTitle className="text-2xl font-bold text-green-800 flex items-center">
              <Users className="w-6 h-6 mr-2" />
              Unirse a un partido
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4 text-gray-600">Bienvenido, {user.firstName || user.name}. Elige un partido y únete para jugar!</p>
            
            <div className="mb-6 space-y-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="search" className="mb-2 block">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="search"
                      type="text"
                      placeholder="Buscar por club o dirección"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="date" className="mb-2 block">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="price" className="mb-2 block">Precio máximo</Label>
                  <div className="space-y-4">
                    <Slider
                      id="price"
                      min={minPrice}
                      max={maxPrice}
                      step={1}
                      value={[priceFilter]}
                      onValueChange={(value) => setPriceFilter(value[0])}
                      className="w-full"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">${minPrice}</span>
                      <span className="text-lg font-semibold text-green-600">${priceFilter}</span>
                      <span className="text-sm text-gray-500">${maxPrice}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {filteredMatches.map((match) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between p-4 border border-green-100 rounded-lg hover:bg-green-50 transition-colors duration-300"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{match.nombreClub}</p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {match.date.split("T")[0]}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {match.startTime} - {match.endTime}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {match.direccionClub}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Hash className="w-4 h-4 mr-1" />
                      {match.court}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {match.players}/{match.maxPlayers} jugadores
                    </p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {match.price} por jugador
                    </p>
                  </div>
                  <Button
                    onClick={() => match.userJoined ? manejarRetirarse(match.id) : manejarUnirsePartido(match.id)}
                    disabled={(!match.userJoined && match.players >= match.maxPlayers) || loadingMatches[match.id]}
                    className={`min-w-[100px] ${match.userJoined ? 'bg-red-600 hover:bg-red-700' : ''}`}
                  >
                    {loadingMatches[match.id] ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {match.userJoined ? 'Retirándose...' : 'Uniéndose...'}
                      </span>
                    ) : match.userJoined ? 'Retirarse' : (match.players >= match.maxPlayers ? 'Completo' : 'Unirse')}
                  </Button>
                </div>
              ))}
              {filteredMatches.length === 0 && (
                <p className="text-center text-gray-500">No se encontraron partidos que coincidan con los criterios de búsqueda.</p>
              )}
            </div>
          </CardContent>
        </Card>
        <div className="mt-6 text-center">
          <Link href="/menu">
            <Button variant="outline" className="bg-white hover:bg-gray-100 text-green-600 border-green-600 hover:border-green-700 transition-colors duration-300">
              Volver al menú
            </Button>
          </Link>
        </div>
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