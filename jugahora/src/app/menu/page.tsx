'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const menuItems = [
  { href: '/menu', label: 'Menu' },
  { href: '/perfil', label: 'Perfil' },
  { href: '/reserva', label: 'Reservar' },
  { href: '/jugar', label: 'Unirme a un partido' },
]

export default function MenuPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth', {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setUserName(data.user.firstName);
        } else {
          // If unauthorized, redirect to login
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        router.push('/login');
      }
    };

    fetchUserData();
  }, [router]);

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

  return (
    <div className="flex flex-col min-h-screen">
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
            onClick={handleLogout}
          >
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
          className="lg:hidden absolute right-0 left-0 mt-16 bg-white shadow-md z-10 transition-all duration-300 ease-in-out"
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
            <button onClick={handleLogout}>Cerrar sesión</button>
          </nav>
        </div>
      )}

      <main className="flex-1 flex justify-center items-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {userName ? `Hola ${userName}!` : 'Hola!'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-500">Aprovecha nuestras funcionalidades!</p>
            <div className="space-y-4">
              <Link href="/reserva" className="block">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">Reserva tu pista!</Button>
              </Link>
              <Link href="/jugar" className="block">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">Juega un partido!</Button>
              </Link>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500">
              Y prepárate que próximamente habrán más...
            </p>
          </CardFooter>
        </Card>
      </main>

      <footer className="py-6 px-4 md:px-6 border-t">
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