"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Users, Trash2 } from "lucide-react"
import { toast } from "react-hot-toast"

type User = {
  id: number
  firstName: string
  lastName: string
  email: string
}

export function AbonadosDashboard() {
  const [clubId, setClubId] = useState<number | null>(null)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [abonados, setAbonados] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [loadingUserId, setLoadingUserId] = useState<number | null>(null)


  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Obtener club
        const resClub = await fetch("/api/auth", { credentials: "include" })
        const dataClub = await resClub.json()
        setClubId(dataClub.entity.id)
  
        // 2. Obtener usuarios
        const resUsers = await fetch("/api/users")
        const users = await resUsers.json()
        setAllUsers(users)
  
        // 3. Obtener abonados
        const resAbonados = await fetch(`/api/abonados?clubId=${dataClub.entity.id}`)
        const dataAbonados = await resAbonados.json()
        setAbonados(dataAbonados)
      } catch (error) {
        console.error("Error al cargar datos de abonados:", error)
      } finally {
        setIsLoading(false)
      }
    }
  
    fetchData()
  }, [])
  

  const handleAgregar = async (userId: number) => {
    setLoadingUserId(userId)
    const res = await fetch("/api/abonados", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clubId, userId }),
    })
    if (res.ok) {
      const newUser = allUsers.find((u) => u.id === userId)
      setAbonados([...abonados, newUser!])
      toast.success("Jugador agregado")
    }
    setLoadingUserId(null)
  }

  const handleEliminar = async (userId: number) => {
    setLoadingUserId(userId)
    const res = await fetch(`/api/abonados?clubId=${clubId}&userId=${userId}`, {
      method: "DELETE",
    })
    if (res.ok) {
      setAbonados(abonados.filter((u) => u.id !== userId))
      toast.success("Jugador eliminado")
    }
    setLoadingUserId(null)
  }

  const abonadosIds = abonados.map((u) => u.id)
  const filteredUsers = allUsers
    .filter((u) => `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => (abonadosIds.includes(b.id) ? 1 : -1))

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-lg text-gray-600">Cargando jugadores abonados...</p>
      </div>
    )
  }
    
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      <div className="flex-1 px-4 py-6 md:px-6 md:ml-16 space-y-6 overflow-x-hidden mt-10">
        <Card>
          <CardHeader>
            <CardTitle>Gestionar Jugadores Abonados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Buscar jugador por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border p-4 rounded-md hover:bg-green-50 transition"
              >
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-green-700" />
                  <div>
                    <p className="font-semibold">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                {abonadosIds.includes(user.id) ? (
                  <Button
                    variant="destructive"
                    disabled={loadingUserId === user.id}
                    onClick={() => handleEliminar(user.id)}
                  >
                    {loadingUserId === user.id ? (
                      <span className="flex items-center gap-2">
                        <span className="loader"></span> Quitando...
                      </span>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Quitar
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    disabled={loadingUserId === user.id}
                    onClick={() => handleAgregar(user.id)}
                  >
                    {loadingUserId === user.id ? (
                      <span className="flex items-center gap-2">
                        <span className="loader"></span> Agregando...
                      </span>
                    ) : (
                      "Agregar"
                    )}
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
