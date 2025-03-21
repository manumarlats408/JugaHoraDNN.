"use client"

import type React from "react"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  CalendarIcon,
  Plus,
  Trash2,
  Edit,
  Users,
  Clock,
  Hash,
  Bell,
  LayoutDashboard,
  CalendarPlus2Icon as CalendarIcon2,
  ClipboardList,
  DollarSign,
  Package,
  BarChart3,
  LogOut,
  Menu,
} from "lucide-react"
import Image from "next/image"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Match = {
  id: number
  date: string
  startTime: string
  endTime: string
  court: string
  players: number
  price: number
}

type Club = {
  id: string
  name: string
  email: string
  phoneNumber?: string
  address?: string
}

type User = {
  id: number
  firstName: string
  lastName: string
}

type CashMovement = {
  id: number
  date: string
  concept: string
  amount: number
  type: "income" | "expense"
}

type InventoryItem = {
  id: number
  name: string
  quantity: number
  minStock: number
  price: number
}

export default function ClubDashboard() {
  const [currentDate] = useState<Date>(new Date())
  const [matches, setMatches] = useState<Match[]>([])
  const [newMatch, setNewMatch] = useState({ date: "", startTime: "", endTime: "", court: "", price: "" })
  const [editMatch, setEditMatch] = useState<Match | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [clubData, setClubData] = useState<Club | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([])
  const [loadingMatches, setLoadingMatches] = useState<{ [key: number]: boolean }>({})
  const [joinedUsers, setJoinedUsers] = useState<User[]>([])
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("dashboard")
  const [cashMovements, setCashMovements] = useState<CashMovement[]>([
    { id: 1, date: "2024-03-21", concept: "Alquiler Cancha 1", amount: 5000, type: "income" },
    { id: 2, date: "2024-03-21", concept: "Venta de bebidas", amount: 2500, type: "income" },
    { id: 3, date: "2024-03-21", concept: "Pago de servicios", amount: 3000, type: "expense" },
    { id: 4, date: "2024-03-20", concept: "Alquiler Cancha 2", amount: 5000, type: "income" },
    { id: 5, date: "2024-03-20", concept: "Compra de pelotas", amount: 1500, type: "expense" },
  ])
  const [newCashMovement, setNewCashMovement] = useState({ concept: "", amount: "", type: "income" })
  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: 1, name: "Pelotas de pádel", quantity: 24, minStock: 10, price: 1200 },
    { id: 2, name: "Botellas de agua", quantity: 36, minStock: 20, price: 300 },
    { id: 3, name: "Bebidas isotónicas", quantity: 18, minStock: 12, price: 450 },
    { id: 4, name: "Grips", quantity: 15, minStock: 8, price: 800 },
    { id: 5, name: "Toallas", quantity: 10, minStock: 5, price: 600 },
  ])
  const [newInventoryItem, setNewInventoryItem] = useState({ name: "", quantity: "", minStock: "", price: "" })
  const router = useRouter()

  const resetDateFilter = () => {
    setSelectedDate(null)
  }

  const fetchMatches = useCallback(async () => {
    if (!clubData) return
    try {
      const response = await fetch(`/api/matches?clubId=${clubData.id}`, {
        method: "GET",
        credentials: "include",
      })
      if (response.ok) {
        const matchesData = await response.json()
        setMatches(matchesData)
        setFilteredMatches(matchesData)
      } else {
        console.error("Error al obtener los partidos del club:", await response.text())
      }
    } catch (error) {
      console.error("Error al conectar con la API para obtener los partidos:", error)
    }
  }, [clubData])

  const handleMatchClick = async (match: Match) => {
    setLoadingMatches((prev) => ({ ...prev, [match.id]: true }))
    try {
      const response = await fetch(`/api/matches/${match.id}/users`)
      if (response.ok) {
        const users = await response.json()
        setJoinedUsers(users)
        setIsUserModalOpen(true)
      } else {
        console.error("Error al obtener los usuarios del partido:", await response.text())
      }
    } catch (error) {
      console.error("Error al conectar con la API para obtener los usuarios:", error)
    } finally {
      setLoadingMatches((prev) => ({ ...prev, [match.id]: false }))
    }
  }

  useEffect(() => {
    const fetchClubProfile = async () => {
      try {
        setIsLoading(true)
        const authResponse = await fetch("/api/auth", {
          method: "GET",
          credentials: "include",
        })

        if (authResponse.ok) {
          const data = await authResponse.json()
          const club = data.entity
          setClubData(club)
        } else {
          throw new Error("Failed to fetch club data")
        }
      } catch (error) {
        console.error("Error al obtener el perfil del club:", error)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    fetchClubProfile()
  }, [router])

  useEffect(() => {
    if (clubData) {
      fetchMatches()
    }
  }, [clubData, fetchMatches])

  useEffect(() => {
    if (!selectedDate) {
      setFilteredMatches(matches)
    } else {
      const filtered = matches.filter((match) => {
        const selectedDateString = selectedDate.toISOString().split("T")[0]
        const matchDateString = new Date(match.date).toISOString().split("T")[0]

        return selectedDateString === matchDateString
      })

      setFilteredMatches(filtered)
    }
  }, [matches, selectedDate])

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "GET",
        credentials: "include",
      })
      router.push("/")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  const handleCreateMatch = async () => {
    if (!clubData) return
    try {
      const response = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newMatch, clubId: clubData.id.toString(), price: Number.parseFloat(newMatch.price) }),
      })

      if (response.ok) {
        const createdMatch = await response.json()
        setMatches([...matches, createdMatch])
        setNewMatch({ date: "", startTime: "", endTime: "", court: "", price: "" })
      } else {
        console.error("Error al crear el partido:", await response.text())
      }
    } catch (error) {
      console.error("Error al conectar con la API para crear el partido:", error)
    }
  }

  const handleDeleteMatch = async (id: number) => {
    try {
      const response = await fetch(`/api/matches/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setMatches(matches.filter((match) => match.id !== id))
      } else {
        console.error("Error al eliminar el partido:", await response.text())
      }
    } catch (error) {
      console.error("Error al conectar con la API para eliminar el partido:", error)
    }
  }

  const handleEditMatch = (match: Match) => {
    setEditMatch(match)
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editMatch) return

    try {
      const response = await fetch(`/api/matches/${editMatch.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: editMatch.date,
          startTime: editMatch.startTime,
          endTime: editMatch.endTime,
          court: editMatch.court,
          price: editMatch.price,
        }),
      })

      if (response.ok) {
        const updatedMatch = await response.json()
        setMatches(matches.map((match) => (match.id === updatedMatch.id ? updatedMatch : match)))
        setEditMatch(null)
        setIsEditModalOpen(false)
      } else {
        console.error("Error al actualizar el partido:", await response.text())
      }
    } catch (error) {
      console.error("Error al conectar con la API para actualizar el partido:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const { id, value } = e.target

    if (isEdit && editMatch) {
      setEditMatch((prev) => {
        if (!prev) return prev
        const updatedValue = id === "price" ? (value === "" ? "" : Number.parseFloat(value)) : value
        return { ...prev, [id]: updatedValue }
      })
    } else {
      setNewMatch((prev) => ({
        ...prev,
        [id]: id === "price" ? (value === "" ? "" : Number.parseFloat(value)) : value,
      }))
    }
  }

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const matchDate = matches.find((match) => new Date(match.date).toDateString() === date.toDateString())
      return matchDate ? "bg-green-200" : null
    }
  }

  const handleAddCashMovement = () => {
    if (!newCashMovement.concept || !newCashMovement.amount) return

    const newMovement: CashMovement = {
      id: cashMovements.length + 1,
      date: new Date().toISOString().split("T")[0],
      concept: newCashMovement.concept,
      amount: Number.parseFloat(newCashMovement.amount),
      type: newCashMovement.type as "income" | "expense",
    }

    setCashMovements([newMovement, ...cashMovements])
    setNewCashMovement({ concept: "", amount: "", type: "income" })
  }

  const handleAddInventoryItem = () => {
    if (!newInventoryItem.name || !newInventoryItem.quantity || !newInventoryItem.minStock || !newInventoryItem.price)
      return

    const newItem: InventoryItem = {
      id: inventory.length + 1,
      name: newInventoryItem.name,
      quantity: Number.parseInt(newInventoryItem.quantity),
      minStock: Number.parseInt(newInventoryItem.minStock),
      price: Number.parseFloat(newInventoryItem.price),
    }

    setInventory([...inventory, newItem])
    setNewInventoryItem({ name: "", quantity: "", minStock: "", price: "" })
  }

  const updateInventoryItem = (id: number, field: string, value: string) => {
    setInventory(
      inventory.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            [field]: field === "name" ? value : Number.parseFloat(value),
          }
        }
        return item
      }),
    )
  }

  const deleteInventoryItem = (id: number) => {
    setInventory(inventory.filter((item) => item.id !== id))
  }

  const getTotalIncome = () => {
    return cashMovements
      .filter((movement) => movement.type === "income")
      .reduce((total, movement) => total + movement.amount, 0)
  }

  const getTotalExpense = () => {
    return cashMovements
      .filter((movement) => movement.type === "expense")
      .reduce((total, movement) => total + movement.amount, 0)
  }

  const getBalance = () => {
    return getTotalIncome() - getTotalExpense()
  }

  const getTodayMovements = () => {
    const today = new Date().toISOString().split("T")[0]
    return cashMovements.filter((movement) => movement.date === today)
  }

  const getLowStockItems = () => {
    return inventory.filter((item) => item.quantity <= item.minStock)
  }

  const getInventoryValue = () => {
    return inventory.reduce((total, item) => total + item.quantity * item.price, 0)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-lg text-gray-600">Cargando dashboard del club...</p>
      </div>
    )
  }

  if (!clubData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-lg text-gray-600">No se pudo cargar el dashboard del club. Por favor, inténtalo de nuevo.</p>
      </div>
    )
  }

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "calendar", label: "Calendario", icon: CalendarIcon2 },
    { id: "matches", label: "Partidos", icon: ClipboardList },
    { id: "cash", label: "Caja", icon: DollarSign },
    { id: "inventory", label: "Stock", icon: Package },
    { id: "stats", label: "Estadísticas", icon: BarChart3 },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar para pantallas grandes */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-white">
        <div className="p-4 border-b flex items-center gap-2">
          <Image src="/logo.svg" alt="JugáHora Logo" width={32} height={32} />
          <span className="text-xl font-bold">JugáHora</span>
        </div>
        <div className="flex flex-col flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                activeSection === item.id ? "bg-green-100 text-green-800" : "hover:bg-gray-100",
              )}
              onClick={() => setActiveSection(item.id)}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}
        </div>
        <div className="p-4 border-t">
          <button
            className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Menú móvil */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="p-4 border-b flex items-center gap-2">
                  <Image src="/logo.svg" alt="JugáHora Logo" width={32} height={32} />
                  <span className="text-xl font-bold">JugáHora</span>
                </div>
                <div className="flex flex-col p-4 space-y-2">
                  {sidebarItems.map((item) => (
                    <button
                      key={item.id}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        activeSection === item.id ? "bg-green-100 text-green-800" : "hover:bg-gray-100",
                      )}
                      onClick={() => {
                        setActiveSection(item.id)
                        // Cerrar el sheet después de seleccionar
                        document.body.click()
                      }}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="p-4 border-t mt-auto">
                  <button
                    className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5" />
                    Cerrar Sesión
                  </button>
                </div>
              </SheetContent>
            </Sheet>

            <h1 className="text-xl font-bold md:text-2xl">
              {clubData.name} - {sidebarItems.find((item) => item.id === activeSection)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Notificaciones</span>
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-600"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-4 py-3 text-sm font-medium">Notificaciones</div>
                <DropdownMenuItem>
                  <div className="flex flex-col">
                    <span className="font-medium">Nuevo partido creado</span>
                    <span className="text-sm text-gray-500">Cancha 1, hoy a las 18:00</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex flex-col">
                    <span className="font-medium">Recordatorio: Mantenimiento</span>
                    <span className="text-sm text-gray-500">Cancha 3, mañana a las 10:00</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex flex-col">
                    <span className="font-medium">Partido cancelado</span>
                    <span className="text-sm text-gray-500">Cancha 2, 20/03 a las 19:00</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden md:block">
              <Button variant="ghost" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </header>

        {/* Contenido principal */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {/* Dashboard */}
          {activeSection === "dashboard" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Partidos Hoy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {
                        matches.filter((match) => {
                          const today = new Date().toISOString().split("T")[0]
                          return new Date(match.date).toISOString().split("T")[0] === today
                        }).length
                      }
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Balance de Caja</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${getBalance().toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Productos en Stock</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{inventory.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Alertas de Stock</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{getLowStockItems().length}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Próximos Partidos</CardTitle>
                    <CardDescription>Partidos programados para los próximos días</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-4">
                        {matches.slice(0, 5).map((match) => (
                          <div
                            key={match.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                          >
                            <div>
                              <p className="font-semibold">{new Date(match.date).toLocaleDateString()}</p>
                              <p className="text-sm text-gray-500">
                                {match.startTime} - {match.court}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium bg-green-100 text-green-800 px-2 py-1 rounded">
                                ${match.price}
                              </span>
                              <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {match.players}/4
                              </span>
                            </div>
                          </div>
                        ))}
                        {matches.length === 0 && (
                          <p className="text-center text-gray-500 py-4">No hay partidos programados.</p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => setActiveSection("matches")}>
                      Ver todos los partidos
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Movimientos de Caja Recientes</CardTitle>
                    <CardDescription>Últimos movimientos registrados</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-4">
                        {cashMovements.slice(0, 5).map((movement) => (
                          <div
                            key={movement.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                          >
                            <div>
                              <p className="font-semibold">{movement.concept}</p>
                              <p className="text-sm text-gray-500">{movement.date}</p>
                            </div>
                            <span
                              className={cn(
                                "text-sm font-medium px-2 py-1 rounded",
                                movement.type === "income" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
                              )}
                            >
                              {movement.type === "income" ? "+" : "-"}${movement.amount}
                            </span>
                          </div>
                        ))}
                        {cashMovements.length === 0 && (
                          <p className="text-center text-gray-500 py-4">No hay movimientos registrados.</p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => setActiveSection("cash")}>
                      Ver todos los movimientos
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}

          {/* Calendario */}
          {activeSection === "calendar" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Calendario de Partidos</CardTitle>
                  <CardDescription>Vista mensual de los partidos programados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/2">
                      <Calendar
                        value={selectedDate || currentDate}
                        onChange={(date) => setSelectedDate(date as Date)}
                        tileClassName={tileClassName}
                        className="w-full"
                      />
                      <Button onClick={resetDateFilter} className="mt-4 w-full">
                        Mostrar Todos los Partidos
                      </Button>
                    </div>
                    <div className="md:w-1/2">
                      <h3 className="text-lg font-medium mb-4">
                        {selectedDate ? `Partidos para ${selectedDate.toLocaleDateString()}` : "Todos los partidos"}
                      </h3>
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-4">
                          {filteredMatches.map((match) => (
                            <div
                              key={match.id}
                              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                            >
                              <div>
                                <p className="font-semibold">{new Date(match.date).toLocaleDateString()}</p>
                                <div className="flex flex-col text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {match.startTime} - {match.endTime}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Hash className="w-3 h-3" />
                                    {match.court}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {match.players}/4
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">${match.price}</span>
                                <div className="flex space-x-1">
                                  <Button variant="ghost" size="icon" onClick={() => handleEditMatch(match)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleDeleteMatch(match.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                          {filteredMatches.length === 0 && (
                            <p className="text-center text-gray-500 py-4">No hay partidos para esta fecha.</p>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Partidos */}
          {activeSection === "matches" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Gestión de Partidos</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" /> Crear Partido
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Crear Nuevo Partido</DialogTitle>
                      <DialogDescription>
                        Ingresa los detalles del nuevo partido aquí. Haz clic en guardar cuando hayas terminado.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">
                          Fecha
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          className="col-span-3"
                          value={newMatch.date}
                          onChange={(e) => handleInputChange(e)}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="startTime" className="text-right">
                          Hora de Inicio
                        </Label>
                        <Input
                          id="startTime"
                          type="time"
                          className="col-span-3"
                          value={newMatch.startTime}
                          onChange={(e) => handleInputChange(e)}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="endTime" className="text-right">
                          Hora de Fin
                        </Label>
                        <Input
                          id="endTime"
                          type="time"
                          className="col-span-3"
                          value={newMatch.endTime}
                          onChange={(e) => handleInputChange(e)}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="court" className="text-right">
                          Cancha
                        </Label>
                        <Input
                          id="court"
                          className="col-span-3"
                          value={newMatch.court}
                          onChange={(e) => handleInputChange(e)}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">
                          Precio
                        </Label>
                        <Input
                          id="price"
                          type="text"
                          className="col-span-3"
                          value={newMatch.price}
                          onChange={(e) => handleInputChange(e)}
                          onInput={(e) => {
                            e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "")
                          }}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreateMatch}>Guardar Partido</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Partidos Programados</CardTitle>
                  <CardDescription>Administra todos los partidos del club</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {matches.map((match) => (
                      <div
                        key={match.id}
                        className="flex items-center justify-between p-4 border border-green-100 rounded-lg hover:bg-green-50 transition-colors duration-300 cursor-pointer relative"
                        onClick={() => handleMatchClick(match)}
                      >
                        <div>
                          <p className="font-semibold text-gray-800">{new Date(match.date).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            {new Date(match.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {match.startTime} - {match.endTime}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Hash className="w-4 h-4 mr-1" />
                            {match.court}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {match.players}/4
                          </p>
                          <span className="text-sm font-semibold text-green-600">${match.price}</span>
                        </div>
                        <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                          <Button variant="outline" size="icon" onClick={() => handleEditMatch(match)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleDeleteMatch(match.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {loadingMatches[match.id] && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-lg">
                            <svg
                              className="animate-spin h-5 w-5 text-green-600"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                    {matches.length === 0 && (
                      <p className="text-center text-gray-500 py-4">No hay partidos programados.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Caja */}
          {activeSection === "cash" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">${getTotalIncome().toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">${getTotalExpense().toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={cn("text-2xl font-bold", getBalance() >= 0 ? "text-green-600" : "text-red-600")}>
                      ${getBalance().toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Registrar Movimiento</CardTitle>
                    <CardDescription>Añade un nuevo movimiento de caja</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="concept" className="text-right">
                          Concepto
                        </Label>
                        <Input
                          id="concept"
                          className="col-span-3"
                          value={newCashMovement.concept}
                          onChange={(e) => setNewCashMovement({ ...newCashMovement, concept: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">
                          Monto
                        </Label>
                        <Input
                          id="amount"
                          type="text"
                          className="col-span-3"
                          value={newCashMovement.amount}
                          onChange={(e) =>
                            setNewCashMovement({ ...newCashMovement, amount: e.target.value.replace(/\D/g, "") })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Tipo</Label>
                        <div className="col-span-3 flex gap-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="income"
                              checked={newCashMovement.type === "income"}
                              onChange={() => setNewCashMovement({ ...newCashMovement, type: "income" })}
                              className="h-4 w-4 text-green-600"
                            />
                            <Label htmlFor="income" className="text-sm font-normal">
                              Ingreso
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="expense"
                              checked={newCashMovement.type === "expense"}
                              onChange={() => setNewCashMovement({ ...newCashMovement, type: "expense" })}
                              className="h-4 w-4 text-red-600"
                            />
                            <Label htmlFor="expense" className="text-sm font-normal">
                              Gasto
                            </Label>
                          </div>
                        </div>
                      </div>
                      <Button
                        className="w-full"
                        onClick={handleAddCashMovement}
                        disabled={!newCashMovement.concept || !newCashMovement.amount}
                      >
                        Registrar Movimiento
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Movimientos de Hoy</CardTitle>
                    <CardDescription>Resumen de los movimientos del día</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[250px]">
                      <div className="space-y-4">
                        {getTodayMovements().map((movement) => (
                          <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-semibold">{movement.concept}</p>
                              <p className="text-sm text-gray-500">{movement.date}</p>
                            </div>
                            <span
                              className={cn(
                                "text-sm font-medium px-2 py-1 rounded",
                                movement.type === "income" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
                              )}
                            >
                              {movement.type === "income" ? "+" : "-"}${movement.amount}
                            </span>
                          </div>
                        ))}
                        {getTodayMovements().length === 0 && (
                          <p className="text-center text-gray-500 py-4">No hay movimientos registrados hoy.</p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Historial de Movimientos</CardTitle>
                  <CardDescription>Todos los movimientos registrados</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Concepto</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cashMovements.map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell>{movement.date}</TableCell>
                          <TableCell>{movement.concept}</TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "px-2 py-1 rounded text-xs font-medium",
                                movement.type === "income" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
                              )}
                            >
                              {movement.type === "income" ? "Ingreso" : "Gasto"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            <span className={movement.type === "income" ? "text-green-600" : "text-red-600"}>
                              {movement.type === "income" ? "+" : "-"}${movement.amount}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Inventario */}
          {activeSection === "inventory" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total de Productos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{inventory.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Valor del Inventario</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${getInventoryValue().toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Productos con Stock Bajo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-600">{getLowStockItems().length}</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Añadir Producto</CardTitle>
                  <CardDescription>Registra un nuevo producto en el inventario</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nombre del Producto</Label>
                        <Input
                          id="name"
                          value={newInventoryItem.name}
                          onChange={(e) => setNewInventoryItem({ ...newInventoryItem, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="quantity">Cantidad</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="0"
                          value={newInventoryItem.quantity}
                          onChange={(e) => setNewInventoryItem({ ...newInventoryItem, quantity: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="minStock">Stock Mínimo</Label>
                        <Input
                          id="minStock"
                          type="number"
                          min="0"
                          value={newInventoryItem.minStock}
                          onChange={(e) => setNewInventoryItem({ ...newInventoryItem, minStock: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="price">Precio Unitario</Label>
                        <Input
                          id="price"
                          type="text"
                          value={newInventoryItem.price}
                          onChange={(e) =>
                            setNewInventoryItem({ ...newInventoryItem, price: e.target.value.replace(/\D/g, "") })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-4"
                    onClick={handleAddInventoryItem}
                    disabled={
                      !newInventoryItem.name ||
                      !newInventoryItem.quantity ||
                      !newInventoryItem.minStock ||
                      !newInventoryItem.price
                    }
                  >
                    Añadir Producto
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Inventario</CardTitle>
                  <CardDescription>Gestiona el stock de productos</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Stock Mínimo</TableHead>
                        <TableHead>Precio Unitario</TableHead>
                        <TableHead>Valor Total</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              value={item.quantity}
                              onChange={(e) => updateInventoryItem(item.id, "quantity", e.target.value)}
                              className="w-20 h-8"
                            />
                          </TableCell>
                          <TableCell>{item.minStock}</TableCell>
                          <TableCell>${item.price}</TableCell>
                          <TableCell>${(item.quantity * item.price).toLocaleString()}</TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "px-2 py-1 rounded text-xs font-medium",
                                item.quantity <= item.minStock
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800",
                              )}
                            >
                              {item.quantity <= item.minStock ? "Stock Bajo" : "OK"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => deleteInventoryItem(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Estadísticas */}
          {activeSection === "stats" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total de Partidos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{matches.length}</div>
                    <p className="text-xs text-muted-foreground">
                      +{Math.floor(matches.length * 0.2)} desde el mes pasado
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${getTotalIncome().toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">+15% desde el mes pasado</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Ocupación de Canchas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">78%</div>
                    <p className="text-xs text-muted-foreground">+5% desde el mes pasado</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Jugadores Activos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">124</div>
                    <p className="text-xs text-muted-foreground">+12 desde el mes pasado</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Rendimiento por Cancha</CardTitle>
                    <CardDescription>Ocupación y rentabilidad de cada cancha</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cancha</TableHead>
                          <TableHead>Partidos</TableHead>
                          <TableHead>Ocupación</TableHead>
                          <TableHead className="text-right">Ingresos</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Cancha 1</TableCell>
                          <TableCell>32</TableCell>
                          <TableCell>85%</TableCell>
                          <TableCell className="text-right">$16,000</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Cancha 2</TableCell>
                          <TableCell>28</TableCell>
                          <TableCell>75%</TableCell>
                          <TableCell className="text-right">$14,000</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Cancha 3</TableCell>
                          <TableCell>24</TableCell>
                          <TableCell>65%</TableCell>
                          <TableCell className="text-right">$12,000</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Cancha 4</TableCell>
                          <TableCell>30</TableCell>
                          <TableCell>80%</TableCell>
                          <TableCell className="text-right">$15,000</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Horarios Más Populares</CardTitle>
                    <CardDescription>Distribución de partidos por horario</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Horario</TableHead>
                          <TableHead>Partidos</TableHead>
                          <TableHead>Ocupación</TableHead>
                          <TableHead className="text-right">Ingresos</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Mañana (8-12)</TableCell>
                          <TableCell>24</TableCell>
                          <TableCell>60%</TableCell>
                          <TableCell className="text-right">$12,000</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Mediodía (12-16)</TableCell>
                          <TableCell>18</TableCell>
                          <TableCell>45%</TableCell>
                          <TableCell className="text-right">$9,000</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Tarde (16-20)</TableCell>
                          <TableCell>42</TableCell>
                          <TableCell>95%</TableCell>
                          <TableCell className="text-right">$21,000</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Noche (20-24)</TableCell>
                          <TableCell>30</TableCell>
                          <TableCell>75%</TableCell>
                          <TableCell className="text-right">$15,000</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Resumen Financiero</CardTitle>
                  <CardDescription>Análisis de ingresos y gastos</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="monthly">
                    <TabsList className="mb-4">
                      <TabsTrigger value="weekly">Semanal</TabsTrigger>
                      <TabsTrigger value="monthly">Mensual</TabsTrigger>
                      <TabsTrigger value="yearly">Anual</TabsTrigger>
                    </TabsList>
                    <TabsContent value="weekly">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Concepto</TableHead>
                            <TableHead>Lun</TableHead>
                            <TableHead>Mar</TableHead>
                            <TableHead>Mié</TableHead>
                            <TableHead>Jue</TableHead>
                            <TableHead>Vie</TableHead>
                            <TableHead>Sáb</TableHead>
                            <TableHead>Dom</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Alquiler de canchas</TableCell>
                            <TableCell>$1,200</TableCell>
                            <TableCell>$1,500</TableCell>
                            <TableCell>$1,300</TableCell>
                            <TableCell>$1,400</TableCell>
                            <TableCell>$2,000</TableCell>
                            <TableCell>$2,500</TableCell>
                            <TableCell>$2,200</TableCell>
                            <TableCell className="text-right">$12,100</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Venta de productos</TableCell>
                            <TableCell>$300</TableCell>
                            <TableCell>$350</TableCell>
                            <TableCell>$320</TableCell>
                            <TableCell>$380</TableCell>
                            <TableCell>$450</TableCell>
                            <TableCell>$600</TableCell>
                            <TableCell>$550</TableCell>
                            <TableCell className="text-right">$2,950</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Gastos operativos</TableCell>
                            <TableCell>$200</TableCell>
                            <TableCell>$180</TableCell>
                            <TableCell>$220</TableCell>
                            <TableCell>$190</TableCell>
                            <TableCell>$250</TableCell>
                            <TableCell>$300</TableCell>
                            <TableCell>$280</TableCell>
                            <TableCell className="text-right">$1,620</TableCell>
                          </TableRow>
                          <TableRow className="font-medium">
                            <TableCell>Balance</TableCell>
                            <TableCell>$1,300</TableCell>
                            <TableCell>$1,670</TableCell>
                            <TableCell>$1,400</TableCell>
                            <TableCell>$1,590</TableCell>
                            <TableCell>$2,200</TableCell>
                            <TableCell>$2,800</TableCell>
                            <TableCell>$2,470</TableCell>
                            <TableCell className="text-right">$13,430</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TabsContent>
                    <TabsContent value="monthly">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Concepto</TableHead>
                            <TableHead>Ene</TableHead>
                            <TableHead>Feb</TableHead>
                            <TableHead>Mar</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Alquiler de canchas</TableCell>
                            <TableCell>$45,000</TableCell>
                            <TableCell>$48,000</TableCell>
                            <TableCell>$52,000</TableCell>
                            <TableCell className="text-right">$145,000</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Venta de productos</TableCell>
                            <TableCell>$12,000</TableCell>
                            <TableCell>$13,500</TableCell>
                            <TableCell>$15,000</TableCell>
                            <TableCell className="text-right">$40,500</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Gastos operativos</TableCell>
                            <TableCell>$8,000</TableCell>
                            <TableCell>$7,800</TableCell>
                            <TableCell>$8,200</TableCell>
                            <TableCell className="text-right">$24,000</TableCell>
                          </TableRow>
                          <TableRow className="font-medium">
                            <TableCell>Balance</TableCell>
                            <TableCell>$49,000</TableCell>
                            <TableCell>$53,700</TableCell>
                            <TableCell>$58,800</TableCell>
                            <TableCell className="text-right">$161,500</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TabsContent>
                    <TabsContent value="yearly">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Concepto</TableHead>
                            <TableHead>2022</TableHead>
                            <TableHead>2023</TableHead>
                            <TableHead>2024 (Actual)</TableHead>
                            <TableHead className="text-right">Variación</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Alquiler de canchas</TableCell>
                            <TableCell>$480,000</TableCell>
                            <TableCell>$520,000</TableCell>
                            <TableCell>$145,000</TableCell>
                            <TableCell className="text-right text-green-600">+8.3%</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Venta de productos</TableCell>
                            <TableCell>$120,000</TableCell>
                            <TableCell>$150,000</TableCell>
                            <TableCell>$40,500</TableCell>
                            <TableCell className="text-right text-green-600">+25%</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Gastos operativos</TableCell>
                            <TableCell>$95,000</TableCell>
                            <TableCell>$98,000</TableCell>
                            <TableCell>$24,000</TableCell>
                            <TableCell className="text-right text-red-600">+3.2%</TableCell>
                          </TableRow>
                          <TableRow className="font-medium">
                            <TableCell>Balance</TableCell>
                            <TableCell>$505,000</TableCell>
                            <TableCell>$572,000</TableCell>
                            <TableCell>$161,500</TableCell>
                            <TableCell className="text-right text-green-600">+13.3%</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {editMatch && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Partido</DialogTitle>
              <DialogDescription>
                Modifica los detalles del partido aquí. Haz clic en guardar cuando hayas terminado.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Fecha
                </Label>
                <Input
                  id="date"
                  type="date"
                  className="col-span-3"
                  value={editMatch ? new Date(editMatch.date).toISOString().split("T")[0] : ""}
                  onChange={(e) => handleInputChange(e, true)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startTime" className="text-right">
                  Hora de Inicio
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  className="col-span-3"
                  value={editMatch?.startTime || ""}
                  onChange={(e) => handleInputChange(e, true)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endTime" className="text-right">
                  Hora de Fin
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  className="col-span-3"
                  value={editMatch?.endTime || ""}
                  onChange={(e) => handleInputChange(e, true)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="court" className="text-right">
                  Cancha
                </Label>
                <Input
                  id="court"
                  className="col-span-3"
                  value={editMatch.court}
                  onChange={(e) => handleInputChange(e, true)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Precio
                </Label>
                <Input
                  id="price"
                  type="text"
                  className="col-span-3"
                  value={editMatch?.price === 0 ? "" : editMatch?.price}
                  onChange={(e) => handleInputChange(e, true)}
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "")
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveEdit}>Guardar Cambios</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Usuarios Unidos al Partido</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {joinedUsers.length > 0 ? (
              <ul className="space-y-2">
                {joinedUsers.map((user) => (
                  <li key={user.id} className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{`${user.firstName} ${user.lastName}`}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500">No hay usuarios unidos a este partido.</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsUserModalOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

