"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Sidebar } from "@/components/layout/sidebar"
import { Users } from "lucide-react"
import { useRouter } from "next/navigation"

type PartidoConfirmado = {
  id: number
  date: string
  startTime: string
  endTime: string
  court: string
  price: number
  usuarios: number[]
}

export default function PartidosConfirmados() {
  const [partidos, setPartidos] = useState<PartidoConfirmado[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const cargarPartidos = async () => {
      try {
        const auth = await fetch("/api/auth", { credentials: "include" })
        if (!auth.ok) throw new Error("No autorizado")
        const { entity } = await auth.json()
        const res = await fetch(`/api/partidos-confirmados?clubId=${entity.id}`)
        const data = await res.json()
        setPartidos(data)
      } catch (error) {
        console.error("Error al cargar partidos confirmados:", error)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    cargarPartidos()
  }, [router])

  const formatearFecha = (fechaStr: string) => {
    const [a, m, d] = fechaStr.split("T")[0].split("-")
    return `${d}/${m}/${a}`
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 text-lg">Cargando partidos confirmados...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-4 md:p-6 md:ml-16 space-y-6 overflow-x-hidden">
        <Card>
          <CardHeader>
            <CardTitle>Partidos Confirmados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {partidos.length > 0 ? (
              partidos.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center border p-4 rounded-md hover:bg-green-50 transition"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {formatearFecha(p.date)} | {p.startTime} - {p.endTime} hs
                    </p>
                    <p className="text-sm text-gray-500">Cancha: {p.court}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">${p.price}</p>
                    <p className="flex items-center text-sm text-gray-500 justify-end">
                      <Users className="h-4 w-4 mr-1" /> {p.usuarios.length} jugadores
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-6">No hay partidos confirmados registrados</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
