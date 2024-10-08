import { Button } from "@/components/ui/button"
import { Calendar, UserPlus, Users } from "lucide-react"
import Link from "next/link"
import Image from 'next/image'
import { ReactNode } from 'react'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between">
        <Link className="flex items-center justify-center" href="/">
          <span className="sr-only">JugáHora</span>
          <Image src='/logo.svg' alt="JugáHora Logo" width={32} height={32} /> 
          <span className="ml-2 text-xl font-bold">JugáHora</span>
        </Link>
        <nav className="flex gap-4">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
            Iniciar Sesión
          </Link>
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
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/registro" className="w-full sm:w-auto">
                  <Button className="w-full">Registrarse</Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full">Iniciar Sesión</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-8 sm:mb-12">
              ¿Por qué elegir JugáHora?
            </h2>
            <div className="grid grid-cols-1 gap-8 sm:gap-12 md:grid-cols-3">
              <FeatureCard
                icon={<Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-green-600" />}
                title="Reserva Fácil"
                description="Reserva canchas de pádel en los mejores clubes con solo unos clics."
              />
              <FeatureCard
                icon={<Users className="h-10 w-10 sm:h-12 sm:w-12 text-green-600" />}
                title="Únete a Partidos"
                description="Encuentra y únete a partidos organizados por otros jugadores en tu área."
              />
              <FeatureCard
                icon={<UserPlus className="h-10 w-10 sm:h-12 sm:w-12 text-green-600" />}
                title="Conoce Gente Nueva"
                description="Únete a partidos y actividades para conocer nuevos jugadores de pádel y hacer amigos mientras te diviertes."
              />
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-4 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-center sm:text-left text-gray-500 dark:text-gray-400">
          © 2024 JugáHora. Todos los derechos reservados.
        </p>
        <nav className="flex gap-4 sm:gap-6 sm:ml-auto justify-center sm:justify-start">
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

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex flex-col items-center space-y-2 border border-gray-200 p-4 rounded-lg">
      {icon}
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
        {description}
      </p>
    </div>
  )
}