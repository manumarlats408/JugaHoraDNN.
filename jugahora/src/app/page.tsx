import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Clock, Users, Calendar, Trophy, CheckCircle } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <Link className="flex items-center justify-center" href="/">
            <span className="ml-2 text-xl font-bold text-[#132045]">JugáHora</span>
            <Image src="/logo.svg" alt="JugáHora Logo" width="150" height="40" className="h-10 w-auto" />
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="#jugadores" className="text-sm font-medium text-[#132045] hover:text-blue-700">
              Jugadores
            </Link>
            <Link href="#clubes" className="text-sm font-medium text-[#132045] hover:text-blue-700">
              Clubes
            </Link>
            <Link href="#faq" className="text-sm font-medium text-[#132045] hover:text-blue-700">
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-[#132045]">
              Iniciar Sesión
            </Link>
            <Link href="/registro">
              <Button className="bg-brand-primary hover:bg-brand-primary">Registrarse</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-brand-primary text-white overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="hidden sm:block absolute right-0 top-0 h-full w-1/3 bg-white transform skew-x-12 translate-x-1/2"></div>
            <div className="hidden sm:block absolute left-0 bottom-0 h-1/3 w-full bg-white transform -skew-x-12 translate-y-1/2"></div>
          </div>
          <div className="container relative z-10 py-20 md:py-32">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Reserva tu cancha en segundos</h1>
                <p className="text-xl md:text-2xl">
                  La plataforma que conecta jugadores con clubes deportivos para reservas fáciles y rápidas.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/registro" className="w-full sm:w-auto">
                    <Button size="lg" className="bg-white text-brand-primary hover:bg-gray-100 w-full">
                      Registrarse
                    </Button>
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      className="bg-white text-brand-primary hover:bg-gray-100 w-full"
                    >
                      Iniciar Sesión
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex justify-center">
                <Image
                  src="/hero-image.png"
                  alt="JugáHora App"
                  width="500"
                  height="400"
                  className="rounded-lg shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Jugadores Section */}
        <section id="jugadores" className="py-20 bg-white">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-[#132045]">Para Jugadores</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Clock className="h-6 w-6 text-brand-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[#132045]">Reservas en segundos</h3>
                      <p className="text-gray-600">Encuentra y reserva canchas disponibles con solo unos clics.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Users className="h-6 w-6 text-brand-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[#132045]">Encuentra compañeros</h3>
                      <p className="text-gray-600">Conecta con otros jugadores y organiza partidos fácilmente.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Calendar className="h-6 w-6 text-brand-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[#132045]">Gestiona tu agenda</h3>
                      <p className="text-gray-600">Organiza tus partidos y recibe recordatorios automáticos.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <Image
                  src="/jugadores-app.png"
                  alt="Funcionalidades para jugadores"
                  width="500"
                  height="400"
                  className="rounded-lg shadow-xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Clubes Section */}
        <section id="clubes" className="py-20 bg-gray-50">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 flex justify-center">
                <Image
                  src="/clubes-app.png"
                  alt="Funcionalidades para clubes"
                  width="500"
                  height="400"
                  className="rounded-lg shadow-xl"
                />
              </div>
              <div className="order-1 md:order-2 space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-[#132045]">Para Clubes</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Calendar className="h-6 w-6 text-brand-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[#132045]">Sistema de reservas automatizado</h3>
                      <p className="text-gray-600">Gestiona tus canchas sin esfuerzo y reduce las cancelaciones.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Trophy className="h-6 w-6 text-brand-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[#132045]">Organiza torneos</h3>
                      <p className="text-gray-600">Crea y gestiona competiciones para atraer más jugadores.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <CheckCircle className="h-6 w-6 text-brand-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[#132045]">Análisis y estadísticas</h3>
                      <p className="text-gray-600">Obtén información valiosa sobre el uso de tus instalaciones.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-brand-primary text-white">
          <div className="container text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">Comienza a usar JugáHora hoy mismo</h2>
            <p className="text-xl max-w-2xl mx-auto">
              Únete a miles de jugadores y clubes que ya están disfrutando de una gestión deportiva más eficiente.
            </p>
            <Link href="/registro">
              <Button
                size="lg"
                className="bg-white text-brand-primary hover:bg-gray-100 text-lg px-8 mt-6"
              >
                Registrarse
              </Button>
            </Link>

          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-white">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold text-[#132045] text-center mb-12">Preguntas Frecuentes</h2>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-lg font-medium text-[#132045]">
                    ¿Cómo funciona JugáHora?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    JugáHora conecta jugadores con clubes deportivos, permitiendo reservar canchas en tiempo real,
                    encontrar compañeros de juego y gestionar tu agenda deportiva desde cualquier dispositivo.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-lg font-medium text-[#132045]">
                    ¿Cuánto cuesta usar JugáHora?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Ofrecemos un plan gratuito para jugadores con funcionalidades básicas. Para clubes y funcionalidades
                    avanzadas, contamos con planes premium a partir de $X al mes. Puedes probar todas las
                    funcionalidades gratis durante 14 días.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-lg font-medium text-[#132045]">
                    ¿Qué deportes están disponibles?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Actualmente soportamos pádel, tenis, fútbol 5 y básquetbol. Estamos trabajando para incorporar más
                    deportes próximamente.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-lg font-medium text-[#132045]">
                    ¿Cómo puedo registrar mi club?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Regístrate como administrador, completa el formulario con los datos de tu club, configura tus
                    canchas y horarios, y estarás listo para recibir reservas. Nuestro equipo te guiará en todo el
                    proceso.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-lg font-medium text-[#132045]">
                    ¿Puedo cancelar una reserva?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Sí, puedes cancelar reservas según la política de cada club. Generalmente, las cancelaciones con más
                    de 24 horas de anticipación no tienen penalización.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#132045] text-white py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Image src="/logo.svg" alt="JugáHora Logo" width="150" height="40" className="h-10 w-auto" />
              <p className="text-blue-200">La plataforma que conecta jugadores con clubes deportivos.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Enlaces</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-blue-200 hover:text-white">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link href="#jugadores" className="text-blue-200 hover:text-white">
                    Jugadores
                  </Link>
                </li>
                <li>
                  <Link href="#clubes" className="text-blue-200 hover:text-white">
                    Clubes
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="text-blue-200 hover:text-white">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-blue-200 hover:text-white">
                    Términos y Condiciones
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-blue-200 hover:text-white">
                    Política de Privacidad
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-blue-200 hover:text-white">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Contacto</h3>
              <ul className="space-y-2">
                <li className="text-blue-200">Email: jugahora.contacto@gmail.com</li>
                <li className="text-blue-200">Teléfono: +54 9 11 6373 0035</li>
                <li className="flex space-x-4 mt-4">
                  <Link href="#" className="text-blue-200 hover:text-white">
                    <span className="sr-only">Facebook</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6"
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </Link>
                  <Link href="#" className="text-blue-200 hover:text-white">
                    <span className="sr-only">Instagram</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6"
                    >
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  </Link>
                  <Link href="#" className="text-blue-200 hover:text-white">
                    <span className="sr-only">Twitter</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6"
                    >
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                    </svg>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#183a8f] mt-8 pt-8 text-center text-blue-300">
            <p>© {new Date().getFullYear()} JugáHora. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
