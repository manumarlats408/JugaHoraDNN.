// app/onboarding/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function OnboardingPage() {
  const router = useRouter()
  const [videoFinished, setVideoFinished] = useState(false)

  const handleSkip = () => {
    router.push('/login')
  }

  useEffect(() => {
    if (videoFinished) {
      router.push('/login')
    }
  }, [videoFinished, router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black px-4 py-8">
      <div className="relative w-full max-w-[640px] aspect-video">
        <video
          src="/Jugahora_celular.mp4"
          className="w-full h-full"
          controls
          autoPlay
          onEnded={() => setVideoFinished(true)}
        />
      </div>
      <button
        onClick={handleSkip}
        className="mt-4 text-white bg-green-600 hover:bg-green-700 font-semibold px-4 py-2 rounded"
      >
        Saltar video
      </button>
    </div>
  )
}
