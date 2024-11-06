'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Menu, X, Home, User, Calendar, Users, LogOut, Clock, MapPin } from 'lucide-react'


type Match = {
  id: number
  date: string
  time: string
  court: string
  players: number
  maxPlayers: number
  nombreClub: string
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
  const referenciaMenu = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const alternarMenu = () => setMenuAbierto(!menuAbierto)

  useEffect(() => {
    const manejarClicFuera = (evento: MouseEvent) => {
      if (referenciaMenu.current && !referenciaMenu.current.contains(evento.target as Node)) {
        setMenuAbierto(false)
      }
    }

    document.addEventListener('mousedown', manejarClicFuera)
    return () => {
      document.removeEventListener('mousedown', manejarClicFuera)
    }
  }, [])

  useEffect(() => {
    const obtenerPartidos = async () => {
      try {
        const respuesta = await fetch('/api/matches', {
          method: 'GET',
          credentials: 'include',
        })
        if (respuesta.ok) {
          const matchesData = await respuesta.json()
          setMatches(matchesData)
        } else {
          console.error('Error al obtener los partidos:', await respuesta.text())
        }
      } catch (error) {
        console.error('Error al conectar con la API para obtener los partidos:', error)
      }
    }

    obtenerPartidos()
  }, [])

  const manejarCierreSesion = async () => {
    try {
      await fetch('/api/cerrar-sesion', {
        method: 'GET',
        credentials: 'include',
      })
      router.push('/')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const manejarUnirsePartido = async (idPartido: number) => {
    try {
      // Obtener el ID del usuario autenticado
      const authResponse = await fetch('/api/auth', {
        method: 'GET',
        credentials: 'include',
      });
  
      if (!authResponse.ok) {
        console.error('No se pudo obtener los datos del usuario');
        return;
      }
  
      const authData = await authResponse.json();
      const userId = authData.user.id;  // Suponiendo que el ID del usuario está en `authData.user.id`
  
      // Hacer la solicitud para unirse al partido
      const respuesta = await fetch(`/api/matches/${idPartido}/join`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),  // Enviar el userId en el cuerpo de la solicitud
      });
  
      if (respuesta.ok) {
        const updatedMatch = await respuesta.json();
        setMatches(matches.map(match =>
          match.id === idPartido
            ? { ...match, players: match.players + 1 }
            : match
        ));
      } else {
        console.error('Error al unirse al partido:', await respuesta.text());
      }
    } catch (error) {
      console.error('Error al conectar con la API para unirse al partido:', error);
    }
  };
  

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
        <Card className="w-full max-w-2xl mx-auto shadow-lg border-green-100">
          <CardHeader className="bg-green-50 border-b border-green-100">
            <CardTitle className="text-2xl font-bold text-green-800 flex items-center">
              <Users className="w-6 h-6 mr-2" />
              Unirse a un partido
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4 text-gray-600">Elige un partido y únete para jugar!</p>
            <div className="space-y-4">
              {matches.map((match) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between p-4 border border-green-100 rounded-lg hover:bg-green-50 transition-colors duration-300"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{match.nombreClub}</p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(match.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {match.time}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {match.court}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {match.players}/{match.maxPlayers} jugadores
                    </p>
                  </div>
                  <Button
                    onClick={() => manejarUnirsePartido(match.id)}
                    disabled={match.players >= match.maxPlayers}
                  >
                    {match.players >= match.maxPlayers ? 'Completo' : 'Unirse'}
                  </Button>
                </div>
              ))}
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