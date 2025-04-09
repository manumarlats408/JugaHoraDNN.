"use client"

import type React from "react"

import { Sidebar } from "@/components/layout/sidebar"
import { useState, useEffect } from "react"
import { Search, Download, Upload } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { TablaArticulos } from "@/components/tabla-articulos"
import { importarArticulos } from "@/lib/acciones-cliente"
import { useToast } from "@/hooks/use-toast"
import type { Articulo } from "@/lib/tipos"

export function ListadoArticulos() {
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [cargando, setCargando] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function cargarArticulos() {
      try {
        const respuesta = await fetch("/api/articulos", {
          credentials: "include",
        })
        if (!respuesta.ok) throw new Error("Error al cargar los artículos")
        const datos = await respuesta.json()
        setArticulos(datos)
      } catch (error) {
        console.error(error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los artículos",
          variant: "destructive",
        })
      } finally {
        setCargando(false)
      }
    }

    cargarArticulos()
  }, [toast])

  const articulosFiltrados = articulos.filter(
    (articulo) =>
      articulo.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      articulo.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  )

  const handleImportar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Iniciando importación de archivo")
    if (!e.target.files || e.target.files.length === 0) {
      console.log("No se seleccionó ningún archivo")
      return
    }

    const file = e.target.files[0]
    console.log("Archivo seleccionado:", file.name, file.type)

    if (file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      toast({
        title: "Formato incorrecto",
        description: "Por favor, sube un archivo XLSX",
        variant: "destructive",
      })
      // Resetear el input file
      return
    }

    try {
      setCargando(true)
      const formData = new FormData()
      formData.append("archivo", file)
      console.log("FormData creado con archivo:", file.name)

      const resultado = await importarArticulos(formData)
      console.log("Resultado de importación:", resultado)

      if (resultado.success) {
        toast({
          title: "Éxito",
          description: "Artículos importados correctamente",
        })
        // Recargar artículos
        const respuesta = await fetch("/api/articulos", {
          credentials: "include",
        })
        if (!respuesta.ok) throw new Error("Error al recargar los artículos")
        const datos = await respuesta.json()
        setArticulos(datos)
      } else {
        throw new Error(resultado.error || "Error desconocido al importar")
      }
    } catch (error) {
      console.error("Error en importación:", error)
      toast({
        title: "Error",
        description: "No se pudieron importar los artículos",
        variant: "destructive",
      })
    } finally {
      setCargando(false)
      // Resetear el input file
      e.target.value = ""
    }
  }

  const handleExportar = async () => {
    try {
      setCargando(true)
      const respuesta = await fetch("/api/exportar-articulos")
      const blob = await respuesta.blob()

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "articulos.xlsx"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      toast({
        title: "Éxito",
        description: "Artículos exportados correctamente",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "No se pudieron exportar los artículos",
        variant: "destructive",
      })
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />
      <div className="flex-1 p-3 md:p-6 md:ml-16 space-y-6 overflow-x-hidden">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 md:p-6 border-b">
            <h1 className="text-xl md:text-2xl font-medium text-gray-600">LISTADO DE CONCEPTOS / ARTÍCULOS</h1>
            <p className="text-sm md:text-base text-gray-500 mt-2">
              A continuación podrás encontrar todos los conceptos/artículos del complejo
            </p>
          </div>

          <div className="p-4 md:p-6">
            <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:gap-4 mb-6">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Buscar por nombre o código"
                  className="pl-10"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:gap-3">
                <div className="relative">
                  <input type="file" id="importar" className="hidden" accept=".xlsx, .xls" onChange={handleImportar} />
                  <Button variant="outline" className="flex items-center gap-2 w-full md:w-auto" asChild>
                    <label htmlFor="importar" className="cursor-pointer">
                      <Upload size={18} className="text-green-500" />
                      <span className="whitespace-nowrap">Importar (XLSX)</span>
                    </label>
                  </Button>
                </div>
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 w-full md:w-auto"
                  onClick={handleExportar}
                >
                  <Download size={18} />
                  <span className="whitespace-nowrap">Exportar artículos</span>
                </Button>
              </div>
            </div>

            <TablaArticulos
              articulos={articulosFiltrados}
              cargando={cargando}
              onActualizar={(articulosActualizados) => setArticulos(articulosActualizados)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
