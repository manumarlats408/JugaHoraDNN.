"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X, Home, User, Calendar, Users, LogOut, Trophy, Plus, Clock, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { FeedbackForm } from "@/components/feedback-form"
import { motion } from "framer-motion"

const menuItems = [
  { href: "/menu", label: "Menu", icon: Home },
  { href: "/perfil", label: "Perfil", icon: User },
  { href: "/reserva", label: "Reservar", icon: Calendar },
  { href: "/jugar", label: "Unirme a un partido", icon: Users },
  { href: "/crear-partido", label: "Crear un partido", icon: Plus },
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

  // Datos de ejemplo para próximos partidos
  const proximosPartidos = [
    {
      id: 1,
      tipo: "Partido",
      titulo: "Partido nivel intermedio",
      ubicacion: "Club Siempreviva",
      fecha: "Hoy, 18:00",
      estado: "Confirmado",
    },
    {
      id: 2,
      tipo: "Reserva",
      titulo: "Cancha #3",
      ubicacion: "Padel Center",
      fecha: "Mañana, 20:00",
      estado: "Pendiente",
    },
  ]

  // Funcionalidades principales
  const funcionalidades = [
    {
      id: "reserva",
      titulo: "Reserva tu cancha",
      descripcion: "Encuentra y reserva canchas disponibles",
      icono: <Calendar className="h-6 w-6" />,
      color: "bg-blue-50 text-brand-primary",
      href: "/reserva",
    },
    {
      id: "unirse",
      titulo: "Unite a un partido",
      descripcion: "Encuentra partidos según tu nivel",
      icono: <Users className="h-6 w-6" />,
      color: "bg-green-50 text-green-600",
      href: "/jugar",
    },
    {
      id: "crear",
      titulo: "Crear un partido",
      descripcion: "Organiza tu propio partido",
      icono: <Plus className="h-6 w-6" />,
      color: "bg-purple-50 text-purple-600",
      href: "/crear-partido",
    },
    {
      id: "eventos",
      titulo: "Unite a un evento",
      descripcion: "Participa en torneos y eventos especiales",
      icono: <Trophy className="h-6 w-6" />,
      color: "bg-amber-50 text-amber-600",
      href: "/eventos/unirse",
    },
  ]

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Cargando menu...</div>
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
              className="flex items-center text-sm font-medium text-gray-600 hover:text-brand-primary transition-colors"
              href={item.href}
            >
              <item.icon className="w-4 h-4 mr-2" />
              {item.label}
            </Link>
          ))}
          <button
            className="flex items-center text-sm font-medium text-gray-600 hover:text-brand-primary transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </button>
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden ml-auto text-gray-600 hover:text-brand-primary"
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

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Saludo y bienvenida */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {userName ? `¡Hola ${userName}!` : "¡Bienvenido!"}
          </h1>
          <p className="text-gray-600 mt-1">¿Qué querés hacer hoy?</p>
        </motion.div>

        {/* Funcionalidades principales */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Funcionalidades</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {funcionalidades.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={item.href}>
                  <Card className="h-full hover:shadow-md transition-shadow duration-200 cursor-pointer border-gray-200 hover:border-brand-primary">
                    <CardContent className="p-6">
                      <div className={`${item.color} p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4`}>
                        {item.icono}
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{item.titulo}</h3>
                      <p className="text-gray-600 text-sm">{item.descripcion}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Próximos partidos */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Próximos partidos</h2>
          {proximosPartidos.length > 0 ? (
            <div className="space-y-4">
              {proximosPartidos.map((partido, index) => (
                <motion.div
                  key={partido.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center p-4">
                      <div
                        className={`p-3 rounded-full ${partido.tipo === "Partido" ? "bg-green-50" : "bg-blue-50"} mr-4`}
                      >
                        {partido.tipo === "Partido" ? (
                          <Users
                            className={`h-5 w-5 ${partido.tipo === "Partido" ? "text-green-600" : "text-brand-primary"}`}
                          />
                        ) : (
                          <Calendar
                            className={`h-5 w-5 ${partido.tipo === "Partido" ? "text-green-600" : "text-brand-primary"}`}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{partido.titulo}</h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{partido.ubicacion}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{partido.fecha}</span>
                        </div>
                      </div>
                      <span
                        className={`text-sm px-3 py-1 rounded-full ${
                          partido.estado === "Confirmado"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {partido.estado}
                      </span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center text-gray-500">
              <p>No hay partidos próximos</p>
            </Card>
          )}
        </section>

        {/* Tarjeta de Feedback */}
        <section>
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg text-brand-primary">¿Tenés alguna sugerencia?</CardTitle>
            </CardHeader>
            <CardContent>
              <FeedbackForm />
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="py-6 px-4 md:px-6 bg-white border-t border-gray-200">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-gray-500 mb-4 sm:mb-0">© 2024 JugáHora. Todos los derechos reservados.</p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-4">
              <Link className="text-xs text-gray-500 hover:text-brand-primary transition-colors" href="/menu">
                Términos de Servicio
              </Link>
              <Link className="text-xs text-gray-500 hover:text-brand-primary transition-colors" href="/menu">
                Privacidad
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Navegación inferior móvil */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
        <div className="grid grid-cols-4 gap-1">
          <Link href="/menu" className="flex flex-col items-center py-2">
            <Home className="h-5 w-5 text-brand-primary" />
            <span className="text-xs mt-1 text-brand-primary">Inicio</span>
          </Link>
          <Link href="/reserva" className="flex flex-col items-center py-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <span className="text-xs mt-1 text-gray-500">Reservar</span>
          </Link>
          <Link href="/jugar" className="flex flex-col items-center py-2">
            <Users className="h-5 w-5 text-gray-500" />
            <span className="text-xs mt-1 text-gray-500">Partidos</span>
          </Link>
          <Link href="/perfil" className="flex flex-col items-center py-2">
            <User className="h-5 w-5 text-gray-500" />
            <span className="text-xs mt-1 text-gray-500">Perfil</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
