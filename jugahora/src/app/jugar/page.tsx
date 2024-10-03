'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Menu, X, Home, User, Calendar, Users, LogOut, MessageCircle } from 'lucide-react'

const clubs = [
  { name: 'Pasaje del sol - GEBA', whatsappLink: 'https://chat.whatsapp.com/C8WKYF8gkPb9yVbKWmJIy6' },
  { name: 'Lasaigues Club - Canning', whatsappLink: null },
  { name: 'Palmeras Club', whatsappLink: null },
  { name: 'World Padel Center - CABA', whatsappLink: null },
  { name: 'Premium APA center', whatsappLink: null },
]

const menuItems = [
  { href: '/menu', label: 'Menu', icon: Home },
  { href: '/perfil', label: 'Perfil', icon: User },
  { href: '/reserva', label: 'Reservar', icon: Calendar },
  { href: '/jugar', label: 'Unirme a un partido', icon: Users },
]

export default function JuegaPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

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

  const handleClubClick = (whatsappLink: string | null) => {
    if (whatsappLink) {
      window.location.href = whatsappLink
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="px-4 lg:px-6 h-16 flex items-center relative bg-white shadow-md">
        <Link className="flex items-center justify-center" href="/menu">
          <span className="sr-only">JugáHora</span>
          <span className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-lg">
            JH
          </span>
          <span className="ml-2 text-2xl font-bold text-green-600">JugáHora</span>
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

      <main className="flex-1 p-4 bg-gradient-to-b from-green-50 to-white">
        <Card className="w-full max-w-2xl mx-auto shadow-lg border-green-100">
          <CardHeader className="bg-green-50 border-b border-green-100">
            <CardTitle className="text-2xl font-bold text-green-800 flex items-center">
              <Users className="w-6 h-6 mr-2" />
              Juega un partido
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4 text-gray-600">Conecta con gente en el club que desees!</p>
            <div className="space-y-4">
              {clubs.map((club, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 border border-green-100 rounded-lg cursor-pointer hover:bg-green-50 transition-colors duration-300"
                  onClick={() => handleClubClick(club.whatsappLink)}
                >
                  <Image src="/club.svg" alt={club.name} width={50} height={50} className="rounded-full" />
                  <div>
                    <p className="font-semibold text-gray-800">{club.name}</p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {club.whatsappLink ? 'Grupo de WhatsApp disponible' : 'Sin grupo disponible'}
                    </p>
                  </div>
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
