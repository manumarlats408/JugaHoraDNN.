'use client'

import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from 'next/image'
import Link from 'next/link'

export default function OnboardingPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-100 p-4">
      
      {/* Logo + JugáHora como en login */}
      <Link href="/" className="mb-8 text-2xl font-bold flex items-center">
        <Image src='/logo.svg' alt="JugáHora Logo" width={32} height={32} />
        <span className="ml-2">JugáHora</span>
      </Link>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-black">
            Bienvenido a JugáHora
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <video
            controls
            autoPlay
            className="w-full h-auto rounded-lg"
          >
            <source src="/videos/Jugahora_celular.mp4" type="video/mp4" />
            Tu navegador no soporta el video.
          </video>

          <Button
            onClick={() => router.push('/login')}
            className="w-full bg-black hover:bg-gray-800 text-white font-semibold"
          >
            Saltar tutorial
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
