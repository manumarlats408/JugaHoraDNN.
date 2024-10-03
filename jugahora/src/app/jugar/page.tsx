'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Menu, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

const clubs = [
  { name: 'Pasaje del sol - GEBA', whatsappLink: 'https://chat.whatsapp.com/C8WKYF8gkPb9yVbKWmJIy6' },
  { name: 'Lasaigues Club - Canning', whatsappLink: null }, // Puedes agregar los enlaces de WhatsApp aquí si existen
  { name: 'Palmeras Club', whatsappLink: null },
  { name: 'World Padel Center - CABA', whatsappLink: null },
  { name: 'Premium APA center', whatsappLink: null },
]

export default function JuegaPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

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
      // Llama al endpoint de logout
      await fetch('/api/logout', {
        method: 'GET',
        credentials: 'include', // Asegura que las cookies se envíen
      });

      // Redirige a la página principal después de cerrar sesión
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const menuItems = [
    { href: '/menu', label: 'Menu' },
    { href: '/perfil', label: 'Perfil' },
    { href: '/reserva', label: 'Reservar' },
    { href: '/jugar', label: 'Unirme a un partido' },
  ]

  const handleClubClick = (whatsappLink: string | null) => {
    if (whatsappLink) {
      window.location.href = whatsappLink; // Redirigir al grupo de WhatsApp si hay enlace
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="px-4 lg:px-6 h-16 flex items-center relative bg-white shadow-sm">
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
              className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
          <button onClick={handleLogout}>Cerrar sesión</button>
        </nav>

        <button
          onClick={toggleMenu}
          className="lg:hidden ml-auto text-gray-600 hover:text-green-600 transition-colors focus:outline-none"
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {isMenuOpen && (
          <div
            ref={menuRef}
            className="lg:hidden absolute right-0 left-0 top-16 bg-white shadow-md z-10 transition-all duration-300 ease-in-out"
          >
            <nav className="py-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <button
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => {
                  alert("Cerrar sesión")
                  setIsMenuOpen(false)
                }}
              >
                Cerrar sesión
              </button>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 p-4">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Juega un partido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Conecta con gente en el club que desees!</p>
            <div className="space-y-4">
              {clubs.map((club, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-2 border rounded-lg cursor-pointer"
                  onClick={() => handleClubClick(club.whatsappLink)} // Evento onClick para redirigir al grupo de WhatsApp
                >
                  <Image src="/club.svg" alt={club.name} width={50} height={50} className="rounded-full" />
                  <div>
                    <p className="font-semibold">{club.name}</p>
                    <p className="text-sm text-gray-500">{club.whatsappLink ? 'Grupo de WhatsApp' : 'Sin grupo disponible'}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
