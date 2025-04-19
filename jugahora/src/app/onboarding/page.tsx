'use client'

import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function OnboardingPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-green-800">
            🎥 Bienvenido a JugáHora
          </CardTitle>
          <Button
            variant="default"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            onClick={() => router.push('/login')}
          >
            Saltar tutorial
          </Button>
        </CardHeader>
        <CardContent className="w-full">
          <video
            controls
            autoPlay
            className="w-full h-auto rounded-lg"
          >
            <source src="/videos/Jugahora_celular.mp4" type="video/mp4" />
            Tu navegador no soporta el video.
          </video>
        </CardContent>
      </Card>
    </div>
  )
}
