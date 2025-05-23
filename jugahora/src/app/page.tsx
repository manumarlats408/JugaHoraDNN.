"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Clock, Users, Calendar, Trophy, FileText, Bell, UserCircle, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"

const Twitter = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const Linkedin = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

const Instagram = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12.017 0C8.396 0 7.989.016 6.756.072 5.526.127 4.718.302 4.008.57c-.738.292-1.363.682-1.988 1.307C1.395 2.502 1.005 3.127.713 3.865c-.268.71-.443 1.518-.498 2.748C.159 7.847.143 8.254.143 11.875s.016 4.028.072 5.261c.055 1.23.23 2.038.498 2.748.292.738.682 1.363 1.307 1.988.625.625 1.25 1.015 1.988 1.307.71.268 1.518.443 2.748.498 1.233.056 1.64.072 5.261.072s4.028-.016 5.261-.072c1.23-.055 2.038-.23 2.748-.498.738-.292 1.363-.682 1.988-1.307.625-.625 1.015-1.25 1.307-1.988.268-.71.443-1.518.498-2.748.056-1.233.072-1.64.072-5.261s-.016-4.028-.072-5.261c-.055-1.23-.23-2.038-.498-2.748-.292-.738-.682-1.363-1.307-1.988C19.502 1.395 18.877 1.005 18.139.713c-.71-.268-1.518-.443-2.748-.498C14.158.159 13.751.143 12.017.143zM12.017 2.2c3.556 0 3.978.016 5.38.072 1.299.059 2.006.277 2.476.461.622.242 1.066.532 1.532.998.466.466.756.91.998 1.532.184.47.402 1.177.461 2.476.056 1.402.072 1.824.072 5.38s-.016 3.978-.072 5.38c-.059 1.299-.277 2.006-.461 2.476-.242.622-.532 1.066-.998 1.532-.466.466-.91.756-1.532.998-.47.184-1.177.402-2.476.461-1.402.056-1.824.072-5.38.072s-3.978-.016-5.38-.072c-1.299-.059-2.006-.277-2.476-.461-.622-.242-1.066-.532-1.532-.998-.466-.466-.756-.91-.998-1.532-.184-.47-.402-1.177-.461-2.476-.056-1.402-.072-1.824-.072-5.38s.016-3.978.072-5.38c.059-1.299.277-2.006.461-2.476.242-.622.532-1.066.998-1.532.466-.466.91-.756 1.532-.998.47-.184 1.177-.402 2.476-.461 1.402-.056 1.824-.072 5.38-.072z" />
    <path d="M12.017 5.838c-3.361 0-6.037 2.676-6.037 6.037s2.676 6.037 6.037 6.037 6.037-2.676 6.037-6.037-2.676-6.037-6.037-6.037zm0 9.963c-2.168 0-3.926-1.758-3.926-3.926s1.758-3.926 3.926-3.926 3.926 1.758 3.926 3.926-1.758 3.926-3.926 3.926z" />
    <circle cx="18.406" cy="5.594" r="1.44" />
  </svg>
)


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

// Tipos para el componente FeatureCard
interface FeatureCardProps {
  title: string
  description: string
  icon: React.ReactNode
  color?: "blue" | "green" | "red" | "purple"
}

// Componente de tarjeta de característica
function FeatureCard({ title, description, icon, color = "blue" }: FeatureCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-500",
    green: "bg-green-50 text-green-500",
    red: "bg-red-50 text-red-500",
    purple: "bg-purple-50 text-purple-500",
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className={`${colorClasses[color]} p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4`}>
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
        <section className="pt-6 pb-12 bg-white">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div
                className="space-y-4"
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
                <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
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
                  src="/foto_pelota.webp"
                  alt="Cancha de pádel con pelota - JugáHora"
                  width={450}
                  height={350}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: <Clock className="h-6 w-6" />,
                    title: "Unite a partidos",
                    description: "Encontrá partidos según tu nivel y disponibilidad.",
                    color: "blue" as const,
                  },
                  {
                    icon: <Users className="h-6 w-6" />,
                    title: "Comunidad activa",
                    description: "Conocé jugadores y hacé amigos.",
                    color: "green" as const,
                  },
                  {
                    icon: <UserCircle className="h-6 w-6" />,
                    title: "Perfil personalizado",
                    description: "Configurá tu nivel y preferencias.",
                    color: "purple" as const,
                  },
                  {
                    icon: <Bell className="h-6 w-6" />,
                    title: "Notificaciones",
                    description: "Recibí alertas de partidos y cambios.",
                    color: "red" as const,
                  },
                ].map((item, index) => (
                  <FeatureCard
                    key={index}
                    icon={item.icon}
                    title={item.title}
                    description={item.description}
                    color={item.color}
                  />
                ))}
              </div>

              <motion.div
                className="flex justify-center mt-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Image
                  src="/foto_mockups.svg"
                  alt="Mockups de funcionalidades para jugadores"
                  width={600}
                  height={400}
                  className="rounded-lg"
                />
              </motion.div>
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
                    color: "blue" as const,
                  },
                  {
                    icon: <Trophy className="h-6 w-6" />,
                    title: "Creación de eventos",
                    description: "Organizá torneos y eventos especiales.",
                    color: "green" as const,
                  },
                  {
                    icon: <FileText className="h-6 w-6" />,
                    title: "Estadísticas",
                    description: "Accedé a datos de uso y rendimiento.",
                    color: "purple" as const,
                  },
                  {
                    icon: <Bell className="h-6 w-6" />,
                    title: "Notificaciones",
                    description: "Recibí alertas de reservas y cambios.",
                    color: "red" as const,
                  },
                ].map((item, index) => (
                  <FeatureCard
                    key={index}
                    icon={item.icon}
                    title={item.title}
                    description={item.description}
                    color={item.color}
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
                  className="flex justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden max-w-4xl mx-auto">
                    <Image
                      src="/dashboard.webp"
                      alt="Dashboard de JugáHora"
                      width={900}
                      height={500}
                      className="w-full h-auto"
                    />
                  </div>
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
                    <Twitter />
                  </Link>
                  <Link href="#" className="text-gray-600 hover:text-blue-500 transition-colors duration-200">
                    <Linkedin />
                  </Link>
                  <Link href="#" className="text-gray-600 hover:text-blue-500 transition-colors duration-200">
                    <Instagram />
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
