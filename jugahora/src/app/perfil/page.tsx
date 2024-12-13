'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Menu, X, Home, User, Calendar, Users, LogOut, Mail, Phone, MapPin, Clock, Plus, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  address?: string
  age?: number
  nivel?: string
  preferredSide?: string
  strengths?: string[]
  weaknesses?: string[]
  progress: number
}

interface Partido {
  id: number
  fecha: string
  jugadores: string
  resultado: string
  ganado: boolean
  procesado: boolean
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
  const [jugadores, setJugadores] = useState<string[]>([])
  const [numSets, setNumSets] = useState('2')
  const [isAddingPartido, setIsAddingPartido] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [ganado, setGanado] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const [scores, setScores] = useState([
    [0, 0],
    [0, 0],
    [0, 0]
  ])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const authResponse = await fetch('/api/auth', {
          method: 'GET',
          credentials: 'include',
        });
  
        if (authResponse.ok) {
          const data = await authResponse.json();
          const user = data.entity;
          console.log('User:', user);
          setUserData(user);
          setJugadores([user.firstName || 'Jugador 1', 'Jugador 2', 'Jugador 3', 'Jugador 4']);
  
          const partidosResponse = await fetch(`/api/partidos?userId=${user.id}`, {
            method: 'GET',
            credentials: 'include',
          });
  
          if (partidosResponse.ok) {
            const partidosData = await partidosResponse.json();
            setPartidos(partidosData);
  
            // Filtrar partidos no procesados
            const partidosNoProcesados = partidosData.filter(
              (partido: Partido) => !partido.procesado
            );
  
            if (partidosNoProcesados.length > 0) {
              // Calcular incrementos y decrementos
              const ganados = partidosNoProcesados.filter((partido: Partido) => partido.ganado).length;
              const perdidos = partidosNoProcesados.filter((partido: Partido) => !partido.ganado).length;
  
              // Actualizar progreso y nivel
              setUserData((prev) => {
                if (!prev) return prev;
  
                let updatedProgress = prev.progress + ganados * 10 - perdidos * 10;
  
                if (updatedProgress >= 100) {
                  updatedProgress = 0;
                  return {
                    ...prev,
                    progress: updatedProgress,
                    nivel: `Nivel ${parseInt(prev.nivel?.split(' ')[1] || '1') + 1}`,
                  };
                }
  
                if (updatedProgress < 0) {
                  const nivelActual = parseInt(prev.nivel?.split(' ')[1] || '1');
                  if (nivelActual > 1) {
                    updatedProgress = 90; // Restablecer progreso al nivel anterior
                    return {
                      ...prev,
                      progress: updatedProgress,
                      nivel: `Nivel ${nivelActual - 1}`,
                    };
                  } else {
                    updatedProgress = 0; // No puedes bajar de nivel 1
                  }
                }
  
                return {
                  ...prev,
                  progress: updatedProgress,
                };
              });
  
              // Marcar los partidos como procesados en el backend
              await fetch(`/api/marcar-partidos-procesados`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: user.id }),
              });
            }
          } else {
            console.error('Error al obtener los partidos del usuario');
          }
        } else {
          throw new Error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error al obtener el perfil del usuario:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchUserProfile();
  
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [router]);
  
  

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

  const handleScoreClick = (setIndex: number, teamIndex: number) => {
    const newScores = [...scores]
    newScores[setIndex][teamIndex] = (newScores[setIndex][teamIndex] + 1) % 8
    setScores(newScores)
  }

  const handleAddPartido = async () => {
    setIsAddingPartido(true)
    const resultado = scores
      .slice(0, parseInt(numSets))
      .map(set => set.join('-'))
      .join(' - ')
    const partidoData = {
      userId: userData?.id,
      fecha,
      jugadores: jugadores.join(', '),
      resultado,
      ganado
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
        setFecha('')
        setScores([[0, 0], [0, 0], [0, 0]])
        setIsDialogOpen(false)
      } else {
        console.error('Error al añadir el partido')
      }
    } catch (error) {
      console.error('Error al añadir el partido:', error)
    } finally {
      setIsAddingPartido(false)
    }
  }

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
        <p className="text-lg text-gray-600">No se pudo cargar el perfil. Por favor, inténtalo de nuevo.</p>
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
              <p><strong>Nombre:</strong> {userData.firstName} {userData.lastName}</p>
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
            {userData.nivel && (
              <div className="flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-500" />
                <p><strong>Nivel:</strong> {userData.nivel}</p>
              </div>
            )}
            <div className="space-y-4">
            <Label htmlFor="progress" className="block text-green-800 text-lg font-bold">Progreso en el Nivel</Label>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-600 h-4 rounded-full"
                style={{ width: `${userData.progress || 0}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">Progreso actual: {userData.progress || 0}%</p>
            </div>
            
            {userData.preferredSide && (
              <div className="flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-500" />
                <p><strong>Lado preferido:</strong> {userData.preferredSide}</p>
              </div>
            )}
            {userData.strengths && userData.strengths.length > 0 && (
              <div className="flex items-start">
                <User className="w-5 h-5 mr-2 mt-1 text-gray-500" />
                <div>
                  <p><strong>Fortalezas:</strong></p>
                  <ul className="list-disc pl-5">
                    {userData.strengths.map((strength, index) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {userData.weaknesses && userData.weaknesses.length > 0 && (
              <div className="flex items-start">
                <User className="w-5 h-5 mr-2 mt-1 text-gray-500" />
                <div>
                  <p><strong>Debilidades:</strong></p>
                  <ul className="list-disc pl-5">
                    {userData.weaknesses.map((weakness, index) => (
                      <li key={index}>{weakness}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            <Button
              className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
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
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Añadir Nuevo Partido</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="fecha" className="text-right">
                        Fecha
                      </Label>
                      <Input
                        id="fecha"
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    {jugadores.map((jugador, index) => (
                      <div key={index} className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor={`jugador${index + 1}`} className="text-right">
                          Jugador {index + 1}
                        </Label>
                        <Input
                          id={`jugador${index + 1}`}
                          value={jugador}
                          onChange={(e) => {
                            const newJugadores = [...jugadores]
                            newJugadores[index] = e.target.value
                            setJugadores(newJugadores)
                          }}
                          placeholder={index === 0 ? userData.firstName : `Jugador ${index + 1}`}
                          className="col-span-3"
                        />
                      </div>
                    ))}
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="numSets" className="text-right">
                        Número de Sets
                      </Label>
                      <Select value={numSets} onValueChange={setNumSets}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Seleccionar número de sets" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 Sets</SelectItem>
                          <SelectItem value="3">3 Sets</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="ganado" className="text-right">
                        Resultado
                      </Label>
                      <Select value={ganado.toString()} onValueChange={(value) => setGanado(value === 'true')}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Seleccionar resultado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Ganado</SelectItem>
                          <SelectItem value="false">Perdido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-center">Puntuación</Label>
                      {scores.slice(0, parseInt(numSets)).map((set, setIndex) => (
                        <div key={setIndex} className="flex flex-col gap-2">
                          <span className="text-sm font-medium">Set {setIndex + 1}</span>
                          <div className="flex justify-between items-center">
                            <span className="text-xs">{jugadores[0]} / {jugadores[1]}</span>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleScoreClick(setIndex, 0)}
                
                              >
                                {set[0]}
                              </Button>
                              <span className="text-sm font-medium">-</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleScoreClick(setIndex, 1)}
                              >
                                {set[1]}
                              </Button>
                            </div>
                            <span className="text-xs">{jugadores[2]} / {jugadores[3]}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button 
                    onClick={handleAddPartido} 
                    className="w-full" 
                    disabled={isAddingPartido}
                  >
                    {isAddingPartido ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Añadiendo...
                      </>
                    ) : (
                      'Añadir Partido'
                    )}
                  </Button>
                  <DialogClose asChild>
                    <button className="absolute top-2 right-2 inline-flex items-center justify-center rounded-full p-2 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
                      <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                    </button>
                  </DialogClose>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {partidos.length > 0 ? (
              partidos.map((partido) => (
                <div key={partido.id} className="border-b border-gray-200 pb-2">
                  <p><strong>Fecha:</strong> {new Date(partido.fecha).toLocaleDateString()}</p>
                  <p><strong>Jugadores:</strong> {partido.jugadores}</p>
                  <p><strong>Resultado:</strong> {partido.resultado}</p>
                  <p><strong>Estado:</strong> {partido.ganado ? 'Ganado' : 'Perdido'}</p>
                </div>
              ))
            ) : (
              <p>No hay partidos registrados aún.</p>
            )}
          </CardContent>
        </Card>
        </main>

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