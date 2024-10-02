'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Menu, X } from 'lucide-react'

const clubs = [
  { name: 'Pasaje del sol - GEBA', phone: '+54 9 11 5821-1410' },
  { name: 'Lasaigues Club - Canning', phone: '+54 9 11 6052-0467' },
  { name: 'Palmeras Club', phone: '+54 9 11 2494-6877' },
  { name: 'World Padel Center - CABA', phone: '+54 9 11 2334-0784' },
  { name: 'Premium APA center', phone: '+54 9 11 6350-6965' },
]

export default function ReservaPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

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

  const menuItems = [
    { href: '/menu', label: 'Menu' },
    { href: '/perfil', label: 'Perfil' },
    { href: '/reservar', label: 'Reservar' },
    { href: '/unirse', label: 'Unirme a un partido' },
  ]

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
          <button
            className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
            onClick={() => alert("Cerrar sesión")}
          >
            Cerrar sesión
          </button>
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
            <CardTitle className="text-2xl font-bold">Reserva tu pista</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Explora todos los clubes disponibles!</p>
            <div className="space-y-4">
              {clubs.map((club, index) => (
                <div key={index} className="flex items-center space-x-4 p-2 border rounded-lg">
                  <Image src="/placeholder.svg" alt={club.name} width={50} height={50} className="rounded-full" />
                  <div>
                    <p className="font-semibold">{club.name}</p>
                    <p className="text-sm text-gray-500">Número de teléfono: {club.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="mt-4 text-center">
          <Link href="/menu">
            <Button variant="outline">Volver al menú</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}