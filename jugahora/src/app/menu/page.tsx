//import jwt_decode from 'jwt-decode'; // Asegúrate de instalar jwt-decode con `npm install jwt-decode`
//import { useEffect, useState } from 'react';
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function MenuPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="/">
          <span className="sr-only">JugáHora</span>
          <span className="h-6 w-6 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
            JH
          </span>
          <span className="ml-2 text-2xl font-bold text-green-600">JugáHora</span>
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

      <main className="flex-1 flex justify-center items-center">
        <Card className="w-full max-w-md p-6 bg-white shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Hola Patricio!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-500">Aprovecha nuestras funcionalidades!</p>
            <div className="space-y-4">
              <Link href="/reserva" className="block">
                <Button className="w-full">Reserva tu pista!</Button>
              </Link>
              <Link href="/jugar" className="block">
                <Button className="w-full">Juega un partido!</Button>
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
