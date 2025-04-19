'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

export default function Onboarding() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Cuando termina el video, redirecciona automáticamente
    const handleEnd = () => {
      router.push('/menu') // o a donde quieras llevar luego
    }

    video.addEventListener('ended', handleEnd)

    return () => {
      video.removeEventListener('ended', handleEnd)
    }
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <h1 className="text-2xl font-bold text-center mb-4 text-green-600">🎥 Bienvenido a JugáHora</h1>

      <div className="relative w-full max-w-md rounded-lg overflow-hidden shadow-lg">
        <video
          ref={videoRef}
          controls
          className="w-full h-auto rounded-lg"
          preload="auto"
        >
          <source src="/videos/Jugahora_celular.mp4" type="video/mp4" />
          Tu navegador no admite la reproducción de video.
        </video>

        <button
          className="absolute top-3 right-3 bg-green-600 text-white px-4 py-2 text-sm rounded hover:bg-green-700"
          onClick={() => router.push('/menu')}
        >
          Saltar tutorial
        </button>
      </div>
    </div>
  )
}
