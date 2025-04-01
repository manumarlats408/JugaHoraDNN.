"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatearPrecio } from "@/lib/utils"
import Link from "next/link"
import { CalendarIcon, Package, DollarSign, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Articulo, Movimiento, Partido, Club, Evento } from "@/lib/tipos"
import { LogOut } from "lucide-react"

export default function DashboardPage() {
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [partidos, setPartidos] = useState<Partido[]>([])
  const [eventos, setEventos] = useState<Evento[]>([]) // 👉 NUEVO
  const [cargando, setCargando] = useState(true)
  const [clubData, setClubData] = useState<Club | null>(null)

  useEffect(() => {
    async function cargarDatos() {
      try {
        setCargando(true)

        // Cargar datos del club
        const authResponse = await fetch("/api/auth", {
          method: "GET",
          credentials: "include",
        })

        if (authResponse.ok) {
          const data = await authResponse.json()
          setClubData(data.entity)

          if (data.entity?.id) {
            // Cargar partidos
            const partidosResponse = await fetch(`/api/matches?clubId=${data.entity.id}`, {
              credentials: "include",
            })
            if (partidosResponse.ok) {
              const partidosData = await partidosResponse.json()
              setPartidos(partidosData)
            }

            // 👉 Cargar eventos
            const eventosResponse = await fetch(`/api/eventos?clubId=${data.entity.id}`, {
              credentials: "include",
            })
            if (eventosResponse.ok) {
              const eventosData = await eventosResponse.json()
              setEventos(eventosData)
            }
          }
        }

        // Cargar artículos
        const articulosResponse = await fetch("/api/articulos")
        if (articulosResponse.ok) {
          const articulosData = await articulosResponse.json()
          setArticulos(articulosData)
        }

        // Cargar movimientos financieros
        const fechaDesde = new Date()
        fechaDesde.setDate(fechaDesde.getDate() - 7)
        const fechaHasta = new Date()

        const movimientosResponse = await fetch(
          `/api/movimientos?desde=${fechaDesde.toISOString().split("T")[0]}&hasta=${fechaHasta.toISOString().split("T")[0]}`,
        )
        if (movimientosResponse.ok) {
          const movimientosData = await movimientosResponse.json()
          setMovimientos(movimientosData)
        }
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error)
      } finally {
        setCargando(false)
      }
    }

    cargarDatos()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "GET",
        credentials: "include",
      })
      window.location.href = "/"
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  // Estadísticas
  const articulosActivos = articulos.filter((a) => a.activo).length
  const totalIngresos = movimientos.reduce((total, m) => total + (m.ingreso || 0), 0)
  const totalEgresos = movimientos.reduce((total, m) => total + (m.egreso || 0), 0)
  const saldoNeto = totalIngresos - totalEgresos
  const partidosProximos = partidos.length

  if (cargando) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-lg text-gray-600">Cargando información del dashboard...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-[4rem] p-6 space-y-6 overflow-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard {clubData?.name ? `de ${clubData.name}` : ""}</h1>
          <Button variant="outline" className="flex items-center gap-2" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* 👉 Partidos */}
          <Link href="/partidos">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Partidos Próximos</CardTitle>
                <CalendarIcon className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{partidosProximos}</div>
                <p className="text-xs text-muted-foreground">
                  {partidosProximos === 1 ? "partido programado" : "partidos programados"}
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* 👉 Eventos */}
          <Link href="/eventos">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Eventos Programados</CardTitle>
                <CalendarIcon className="h-4 w-4 text-indigo-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{eventos.length}</div>
                <p className="text-xs text-muted-foreground">
                  {eventos.length === 1 ? "evento programado" : "eventos programados"}
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* 👉 Inventario */}
          <Link href="/inventario">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Artículos en Inventario</CardTitle>
                <Package className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{articulosActivos}</div>
                <p className="text-xs text-muted-foreground">{articulos.length} artículos en total</p>
              </CardContent>
            </Card>
          </Link>

          {/* 👉 Finanzas */}
          <Link href="/finanzas">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Balance Financiero</CardTitle>
                <DollarSign className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${saldoNeto >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatearPrecio(saldoNeto)}
                </div>
                <p className="text-xs text-muted-foreground">Últimos 7 días</p>
              </CardContent>
            </Card>
          </Link>
      

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Información no disponible</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Últimos Partidos</CardTitle>
          </CardHeader>
          <CardContent>
            {partidos.length > 0 ? (
              <div className="space-y-4">
                {partidos.slice(0, 3).map((partido) => (
                  <div key={partido.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{partido.court}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(partido.date).toLocaleDateString()}, {partido.startTime}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-green-600">${partido.price}</span>
                  </div>
                ))}
                <div className="pt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/partidos">Ver todos los partidos</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No hay partidos programados</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Artículos Populares</CardTitle>
          </CardHeader>
          <CardContent>
            {articulos.length > 0 ? (
              <div className="space-y-4">
                {articulos
                  .filter((a) => a.activo)
                  .slice(0, 3)
                  .map((articulo) => (
                    <div key={articulo.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">{articulo.nombre}</p>
                        <p className="text-sm text-gray-500">Código: {articulo.codigo}</p>
                      </div>
                      <span className="text-sm font-semibold text-green-600">
                        {formatearPrecio(articulo.precioVenta)}
                      </span>
                    </div>
                  ))}
                <div className="pt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/inventario">Ver inventario completo</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No hay artículos disponibles</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimos Movimientos</CardTitle>
          </CardHeader>
          <CardContent>
            {movimientos.length > 0 ? (
              <div className="space-y-4">
                {movimientos.slice(0, 3).map((movimiento) => (
                  <div key={movimiento.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{movimiento.concepto}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(movimiento.fechaMovimiento).toLocaleDateString()}
                      </p>
                    </div>
                    {movimiento.ingreso ? (
                      <span className="text-sm font-semibold text-green-600">
                        +{formatearPrecio(movimiento.ingreso)}
                      </span>
                    ) : (
                      <span className="text-sm font-semibold text-red-600">
                        -{formatearPrecio(movimiento.egreso || 0)}
                      </span>
                    )}
                  </div>
                ))}
                <div className="pt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/finanzas">Ver todos los movimientos</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No hay movimientos recientes</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  )
}

