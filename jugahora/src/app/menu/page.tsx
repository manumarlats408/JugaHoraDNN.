'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, Home, User, Calendar, Users, LogOut } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from 'next/image'

const menuItems = [
  { href: '/menu', label: 'Menu', icon: Home },
  { href: '/perfil', label: 'Perfil', icon: User },
  { href: '/reserva', label: 'Reservar', icon: Calendar },
  { href: '/jugar', label: 'Unirme a un partido', icon: Users },
]

export default function MenuPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/auth', {
          method: 'GET',
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          setUserName(data.entity.firstName || data.entity.name)
        } else {
          throw new Error('Authentication failed')
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-white">
      <header className="px-4 lg:px-6 h-16 flex items-center sticky top-0 z-50 bg-white shadow-md">
        <Link className="flex items-center justify-center" href="/menu">
          <span className="sr-only">JugáHora</span>
          <Image src='/logo.svg' alt="JugáHora Logo" width={32} height={32} />
          <span className="ml-2 text-2xl font-bold text-green-800">JugáHora</span>
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
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </header>

      {isMenuOpen && (
        <div
          ref={menuRef}
          className="lg:hidden fixed top-16 right-0 left-0 bottom-0 bg-white shadow-md z-40 transition-all duration-300 ease-in-out overflow-y-auto"
        >
          <nav className="py-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center px-4 py-3 text-lg text-gray-700 hover:bg-green-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="w-6 h-6 mr-3" />
                {item.label}
              </Link>
            ))}
            <button 
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-lg text-gray-700 hover:bg-green-50 transition-colors"
            >
              <LogOut className="w-6 h-6 mr-3" />
              Cerrar sesión
            </button>
          </nav>
        </div>
      )}

      <main className="flex-1 flex justify-center items-center p-4 md:p-8">
        <Card className="w-full max-w-2xl shadow-lg border-green-100">
          <CardHeader className="bg-green-100 border-b border-green-200">
            <CardTitle className="text-3xl font-bold text-green-800">
              {userName ? `¡Hola ${userName}!` : '¡Bienvenido!'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 pb-6 px-6">
            <p className="mb-8 text-xl text-gray-700">Aprovecha nuestras funcionalidades:</p>
            <div className="grid gap-6 md:grid-cols-2">
              <Link href="/reserva" className="block">
                <Button className="w-full h-16 bg-green-600 hover:bg-green-700 text-white transition-colors duration-300 flex items-center justify-center text-lg">
                  <Calendar className="w-6 h-6 mr-3" />
                  Reserva tu cancha
                </Button>
              </Link>
              <Link href="/jugar" className="block">
                <Button className="w-full h-16 bg-green-600 hover:bg-green-700 text-white transition-colors duration-300 flex items-center justify-center text-lg">
                  <Users className="w-6 h-6 mr-3" />
                  Unite a un partido
                </Button>
              </Link>
            </div>
          </CardContent>
          <CardFooter className="bg-green-50 border-t border-green-100 flex justify-center">
            <p className="text-sm text-gray-600 italic">
              Próximamente más funcionalidades...
            </p>
          </CardFooter>
        </Card>
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