"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X, Home, User, Calendar, Users, LogOut, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { FeedbackForm } from "@/components/feedback-form"

const menuItems = [
  { href: "/menu", label: "Menu", icon: Home },
  { href: "/perfil", label: "Perfil", icon: User },
  { href: "/reserva", label: "Reservar", icon: Calendar },
  { href: "/jugar", label: "Unirme a un partido", icon: Users },
  { href: "/eventos/unirse", label: "Unirme a un evento", icon: Trophy },
]

export default function MenuPage() {
  console.log("Página de menú cargada")
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
        const response = await fetch("/api/auth", {
          method: "GET",
          credentials: "include",
        })
        if (response.ok) {
          const data = await response.json()
          setUserName(data.entity.firstName || data.entity.name)
        } else {
          throw new Error("Authentication failed")
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "GET",
        credentials: "include",
      })
      router.push("/")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="px-4 lg:px-6 h-16 flex items-center relative bg-white shadow-md">
        <Link className="flex items-center justify-center" href="/menu">
          <span className="sr-only">JugáHora</span>
          <Image src="/logo.svg" alt="JugáHora Logo" width={32} height={32} />
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

      <main className="flex-1 px-4 py-8 bg-gradient-to-b from-green-50 to-white flex flex-col items-center space-y-4">
        {/* Tarjeta principal de funcionalidades */}
        <Card className="w-full max-w-md shadow-lg border-green-100">
          <CardHeader className="bg-green-50 border-b border-green-100 py-3">
            <CardTitle className="text-2xl font-bold text-green-800">
              {userName ? `¡Hola ${userName}!` : "¡Bienvenido!"}
            </CardTitle>
          </CardHeader>
          <CardContent className="py-5">
            <p className="mb-5 text-gray-600 text-sm">Aprovecha nuestras funcionalidades:</p>
            <div className="space-y-5">
              <Link href="/reserva">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <Calendar className="w-5 h-5 mr-2" />
                  Reserva tu cancha
                </Button>
              </Link>
              <Link href="/jugar">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <Users className="w-5 h-5 mr-2" />
                  Unite a un partido
                </Button>
              </Link>
              <Link href="/eventos/unirse">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <Trophy className="w-5 h-5 mr-2" />
                  Unite a un evento
                </Button>
              </Link>
            </div>
          </CardContent>
          <CardFooter className="bg-green-50 border-t border-green-100 py-2">
            <p className="text-xs text-gray-600 italic w-full text-center">Próximamente más funcionalidades...</p>
          </CardFooter>
        </Card>

        {/* Tarjeta de feedback */}
        <Card className="w-full max-w-md shadow border-green-100">
          <CardHeader className="py-3">
            <CardTitle className="text-lg text-green-700">¿Tenés alguna sugerencia?</CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            <FeedbackForm />
          </CardContent>
        </Card>
      </main>


    </div>
  )
}

