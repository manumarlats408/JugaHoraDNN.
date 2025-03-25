// Simulación de funciones para manejar archivos Excel
// En un entorno real, usaríamos bibliotecas como xlsx o exceljs
import * as XLSX from "xlsx"
import type { Articulo } from "@/lib/tipos"
import { crearArticulo } from "@/lib/db"

export async function importarArticulosDesdeExcel(file: File): Promise<Articulo[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0] // Tomamos la primera hoja
        const sheet = workbook.Sheets[sheetName]

        interface ExcelRow {
          Código: string
          Nombre: string
          "Precio Compra": number
          "Precio Venta": number
          Tipo: "Ambos" | "Venta"
          "En Stock": string
          Activo: string
        }

        // Convertimos los datos del Excel a JSON
        const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(sheet)

        // Mapear los datos al formato de `Articulo`
        const articulosImportados: Articulo[] = jsonData.map((row) => ({
          id: crypto.randomUUID(), // 🔹 Generamos un ID único si es requerido
          codigo: row["Código"] || "",
          nombre: row["Nombre"] || "",
          precioCompra: parseFloat(row["Precio Compra"] || 0),
          precioVenta: parseFloat(row["Precio Venta"] || 0),
          tipo: row["Tipo"] === "Ambos" ? "Ambos" : "Venta", // Ajusta si hay más tipos
          mostrarEnStock: row["En Stock"] === "Sí",
          activo: row["Activo"] === "Sí",
          ultimaModificacion: new Date().toISOString(), // 🔹 Fecha actual como última modificación
        }))

        // Guardar los artículos en la "base de datos"
        const articulosCreados: Articulo[] = []
        for (const articulo of articulosImportados) {
          const creado = await crearArticulo(articulo)
          articulosCreados.push(creado)
        }

        resolve(articulosCreados)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = (error) => reject(error)
    reader.readAsArrayBuffer(file) // Leemos el archivo como ArrayBuffer
  })
}

export async function exportarArticulosAExcel(articulos: Articulo[]): Promise<ArrayBuffer> {
  // Simular generación de archivo Excel
  await new Promise((resolve) => setTimeout(resolve, 1000))


    console.log(articulos)
  // En un caso real, aquí generaríamos un buffer con una biblioteca como xlsx
  // Para este ejemplo, simplemente devolvemos un buffer vacío

  // Crear un buffer de ejemplo (1KB de datos aleatorios)
  const buffer = new ArrayBuffer(1024)
  const view = new Uint8Array(buffer)

  for (let i = 0; i < 1024; i++) {
    view[i] = Math.floor(Math.random() * 256)
  }

  return buffer
}

