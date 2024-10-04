import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, MapPin, Users } from "lucide-react"
import Link from "next/link"
import Image from 'next/image'

export default function HomePage() {
  return (
    
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="/">
          <span className="sr-only">JugáHora</span>
          <Image src='/logo.svg' alt="JugáHora Logo" width={32} height={32} /> 
          <span className="ml-2 text-2xl font-bold">JugáHora</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          {/* <Link className="text-sm font-medium hover:underline underline-offset-4" href="/reservar">
            Reservar
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/unirse">
            Unirse
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/clubes">
            Clubes
          </Link> */}
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-green-100">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Bienvenido a JugáHora
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Reserva canchas de pádel o únete a partidos existentes en tu área. Juega cuando quieras, donde
                  quieras.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/registro">
                  <Button>Registrarse</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline">Iniciar Sesión</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">
              ¿Por qué elegir JugáHora?
            </h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center space-y-4 text-center">
                <Calendar className="h-12 w-12 text-green-600" />
                <h3 className="text-xl font-bold">Reserva Fácil</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Reserva canchas de pádel en los mejores clubes con solo unos clics.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <Users className="h-12 w-12 text-green-600" />
                <h3 className="text-xl font-bold">Únete a Partidos</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Encuentra y únete a partidos organizados por otros jugadores en tu área.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <MapPin className="h-12 w-12 text-green-600" />
                <h3 className="text-xl font-bold">Clubes Asociados</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Accede a una amplia red de clubes de pádel asociados en toda la ciudad.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-green-100">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  ¿Listo para jugar?
                </h2>
                <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Únete a nuestra comunidad de jugadores de pádel y empieza a disfrutar del juego hoy mismo.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex space-x-2">
                  <Input className="max-w-lg flex-1" placeholder="Ingresa tu email" type="email" />
                  <Button type="submit">Suscribirse</Button>
                </form>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Suscríbete para recibir noticias y ofertas especiales.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2024 JugáHora. Todos los derechos reservados.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="/terminos">
            Términos de Servicio
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="/privacidad">
            Privacidad
          </Link>
        </nav>
      </footer>
    </div>
  )
}