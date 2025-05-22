"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Clock, Users, Calendar, Trophy, FileText, Bell, UserCircle, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"

// Componente FAQ personalizado
function CustomFaq() {
  const [openItem, setOpenItem] = useState<number | null>(null)

  const faqItems = [
    {
      question: "¿Cómo funciona JugáHora?",
      answer:
        "JugáHora es una plataforma que facilita la organización de partidos. Los jugadores pueden unirse fácilmente a partidos o eventos según su nivel. Los clubes pueden publicar sus canchas vacías y JugáHora se encarga de llenarlas.",
    },
    {
      question: "¿Cuánto cuesta usar JugáHora?",
      answer:
        "Para jugadores, cobramos una pequeña comisión por el servicio al momento de confirmar el partido. Para clubes, el primer mes es gratuito. Luego, se cobra por cada cancha que JugáHora organiza.",
    },
    {
      question: "¿Qué deportes están disponibles?",
      answer: "Nos enfocamos 100% en pádel para ofrecer una experiencia de calidad, actualizada y especializada.",
    },
    {
      question: "¿Cómo puedo registrar mi club?",
      answer: "Contactanos directamente y nos encargaremos de crear y configurar tu cuenta en poco tiempo.",
    },
    {
      question: "¿Puedo cancelar una reserva?",
      answer:
        "Sí. Podés cancelar hasta 12 horas antes del inicio del partido sin penalización. Cancelaciones posteriores pueden generar sanciones.",
    },
  ]

  const toggleItem = (index: number) => {
    setOpenItem(openItem === index ? null : index)
  }

  return (
    <div className="space-y-4">
      {faqItems.map((item, index) => (
        <div key={index} className="border-b border-gray-200 last:border-b-0">
          <button
            className="w-full flex justify-between items-center py-6 text-left focus:outline-none"
            onClick={() => toggleItem(index)}
          >
            <h3 className="text-lg font-medium text-gray-800">{item.question}</h3>
            {openItem === index ? (
              <ChevronUp className="h-5 w-5 text-blue-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-blue-500" />
            )}
          </button>
          {openItem === index && (
            <div className="pb-6 text-gray-600 animate-accordion-down">
              <p>{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// Componente de tarjeta de característica
interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color?: "blue" | "green" | "red" | "purple";
}
function FeatureCard({ title, description, icon, color = "blue" }: FeatureCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-500",
    green: "bg-green-50 text-green-500",
    red: "bg-red-50 text-red-500",
    purple: "bg-purple-50 text-purple-500",
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div
        className={`${colorClasses[color as keyof typeof colorClasses]} p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4`}
      >
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
        <div className="container flex h-16 items-center justify-between">
          <Link className="flex items-center justify-center" href="/">
            <span className="text-xl font-bold text-gray-800">JugáHora</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="#jugadores"
              className="text-sm font-medium text-gray-600 hover:text-blue-500 transition-colors duration-200"
            >
              Jugadores
            </Link>
            <Link
              href="#clubes"
              className="text-sm font-medium text-gray-600 hover:text-blue-500 transition-colors duration-200"
            >
              Clubes
            </Link>
            <Link
              href="#como-funciona"
              className="text-sm font-medium text-gray-600 hover:text-blue-500 transition-colors duration-200"
            >
              Cómo funciona
            </Link>
            <Link
              href="#faq"
              className="text-sm font-medium text-gray-600 hover:text-blue-500 transition-colors duration-200"
            >
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-blue-500 transition-colors duration-200"
            >
              Iniciar Sesión
            </Link>
            <Link href="/registro">
              <Button className="bg-blue-500 hover:bg-blue-600 transition-colors duration-200">Registrarse</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 bg-white">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-800">
                  La plataforma para jugadores y clubes de pádel
                </h1>
                <p className="text-xl text-gray-600">
                  JugáHora es la plataforma donde los jugadores encuentran partidos fácilmente y los clubes se
                  despreocupan por llenar sus horarios.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white">
                    Registrarse
                  </Button>
                  <Button variant="outline" size="lg" className="border-gray-300 text-gray-700 hover:bg-gray-100">
                    Conocer más
                  </Button>
                </div>
              </motion.div>
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Image
                  src="/placeholder.svg?height=500&width=500"
                  alt="JugáHora App"
                  width={500}
                  height={400}
                  className="rounded-lg shadow-md"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Jugadores Section */}
        <section id="jugadores" className="py-16 bg-white">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Para Jugadores</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Encontrá partidos, conocé jugadores y disfrutá del pádel sin complicaciones.
              </p>
            </div>

            <div className="space-y-12">
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  alt="Funcionalidades para jugadores"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-md"
                />
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: <Clock className="h-6 w-6" />,
                    title: "Unite a partidos",
                    description: "Encontrá partidos según tu nivel y disponibilidad.",
                    color: "blue",
                  },
                  {
                    icon: <Users className="h-6 w-6" />,
                    title: "Comunidad activa",
                    description: "Conocé jugadores y hacé amigos.",
                    color: "green",
                  },
                  {
                    icon: <UserCircle className="h-6 w-6" />,
                    title: "Perfil personalizado",
                    description: "Configurá tu nivel y preferencias.",
                    color: "purple",
                  },
                  {
                    icon: <Bell className="h-6 w-6" />,
                    title: "Notificaciones",
                    description: "Recibí alertas de partidos y cambios.",
                    color: "red",
                  },
                ].map((item, index) => (
                  <FeatureCard
                    key={index}
                    icon={item.icon}
                    title={item.title}
                    description={item.description}
                    color={item.color as "blue" | "green" | "red" | "purple"}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="como-funciona" className="py-16 bg-gray-50">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Cómo funciona</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                JugáHora simplifica todo el proceso en unos pocos pasos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                {
                  number: "01",
                  title: "Creá tu perfil",
                  description: "Registrate y configurá tu nivel, disponibilidad y preferencias.",
                },
                {
                  number: "02",
                  title: "Encontrá partidos",
                  description: "Buscá partidos disponibles o creá uno nuevo e invitá a otros jugadores.",
                },
                {
                  number: "03",
                  title: "Confirmá y pagá",
                  description: "Confirmá tu asistencia y realizá el pago de forma segura.",
                },
                {
                  number: "04",
                  title: "¡A jugar!",
                  description: "Presentate en la cancha y disfrutá de tu partido.",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="text-blue-500 font-bold text-2xl mb-4">{item.number}</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Clubes Section */}
        <section id="clubes" className="py-16 bg-gray-50">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Para Clubes</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Gestioná tus canchas, organizá eventos y maximizá tus ingresos.
              </p>
            </div>

            <div className="space-y-16">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: <Calendar className="h-6 w-6" />,
                    title: "Gestión de canchas",
                    description: "Publicá tus canchas y JugáHora las llena.",
                    color: "blue",
                  },
                  {
                    icon: <Trophy className="h-6 w-6" />,
                    title: "Creación de eventos",
                    description: "Organizá torneos y eventos especiales.",
                    color: "green",
                  },
                  {
                    icon: <FileText className="h-6 w-6" />,
                    title: "Estadísticas",
                    description: "Accedé a datos de uso y rendimiento.",
                    color: "purple",
                  },
                  {
                    icon: <Bell className="h-6 w-6" />,
                    title: "Notificaciones",
                    description: "Recibí alertas de reservas y cambios.",
                    color: "red",
                  },
                ].map((item, index) => (
                  <FeatureCard
                    key={index}
                    icon={item.icon}
                    title={item.title}
                    description={item.description}
                    color={item.color as "blue" | "green" | "red" | "purple"}
                  />
                ))}
              </div>

              <div>
                <div className="text-center mb-12">
                  <h3 className="text-3xl font-bold text-gray-800 mb-4">Dashboard intuitivo</h3>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Visualizá toda la información importante de tu club en un solo lugar.
                  </p>
                </div>

                <motion.div
                  className="bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <Image
                    src="/dashboard.png"
                    alt="Dashboard de JugáHora"
                    width={1200}
                    height={600}
                    className="w-full h-auto"
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-16 bg-white">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Preguntas Frecuentes</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">Respondemos tus dudas sobre JugáHora.</p>
            </div>
            <motion.div
              className="max-w-3xl mx-auto bg-white rounded-lg border border-gray-200 p-8 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <CustomFaq />
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-blue-500">
          <div className="container text-center">
            <motion.h2
              className="text-3xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Sumate a la comunidad JugáHora
            </motion.h2>
            <motion.p
              className="text-xl text-blue-100 max-w-2xl mx-auto mb-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Unite a una comunidad que te permite encontrar partidos con facilidad si sos jugador, y olvidarte de
              llenar tus horarios si sos club.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button
                size="lg"
                className="bg-white text-blue-500 hover:bg-gray-100 text-lg px-8 transition-all duration-200"
              >
                Comenzar ahora
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white text-gray-700 py-12 border-t border-gray-200">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">J</span>
                </div>
                <span className="text-xl font-semibold text-gray-800">JugáHora</span>
              </div>
              <p className="text-gray-600 text-sm">La plataforma que conecta jugadores con clubes deportivos.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Enlaces</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-500 transition-colors duration-200 text-sm">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link
                    href="#jugadores"
                    className="text-gray-600 hover:text-blue-500 transition-colors duration-200 text-sm"
                  >
                    Jugadores
                  </Link>
                </li>
                <li>
                  <Link
                    href="#clubes"
                    className="text-gray-600 hover:text-blue-500 transition-colors duration-200 text-sm"
                  >
                    Clubes
                  </Link>
                </li>
                <li>
                  <Link
                    href="#faq"
                    className="text-gray-600 hover:text-blue-500 transition-colors duration-200 text-sm"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-500 transition-colors duration-200 text-sm">
                    Términos y Condiciones
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-500 transition-colors duration-200 text-sm">
                    Política de Privacidad
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-500 transition-colors duration-200 text-sm">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Contacto</h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">Email: jugahora.contacto@gmail.com</p>
                <p className="text-gray-600">Teléfono: +54 9 11 6373 0035</p>
                <div className="flex space-x-3 mt-4">
                  <Link href="#" className="text-gray-600 hover:text-blue-500 transition-colors duration-200">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                    </svg>
                  </Link>
                  <Link href="#" className="text-gray-600 hover:text-blue-500 transition-colors duration-200">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  </Link>
                  <Link href="#" className="text-gray-600 hover:text-blue-500 transition-colors duration-200">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-gray-500 text-sm">© 2025 JugáHora. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
