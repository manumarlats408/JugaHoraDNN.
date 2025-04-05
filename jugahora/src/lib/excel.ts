import * as XLSX from "xlsx"
import type { Articulo } from "@/lib/tipos"
import { crearArticulo } from "@/lib/db"

// Este tipo representa las filas del archivo Excel
interface ExcelRow {
  Código: string
  Nombre: string
  "Precio Compra": number
  "Precio Venta": number
  Tipo: "Ambos" | "Venta"
  "En Stock": string
  Activo: string
}

export async function importarArticulosDesdeExcel(file: File, clubId: number): Promise<Articulo[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]

        const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(sheet)

        const articulosImportados: Omit<Articulo, "id">[] = jsonData.map((row) => ({
          codigo: row["Código"] || "",
          nombre: row["Nombre"] || "",
          precioCompra: Number(row["Precio Compra"]) || 0,
          precioVenta: Number(row["Precio Venta"]) || 0,
          tipo: row["Tipo"] === "Ambos" ? "Ambos" : "Venta",
          mostrarStock: row["En Stock"] === "Sí",
          activo: row["Activo"] === "Sí",
          updatedAt: new Date().toISOString(),
          clubId: clubId,
        }))

        const articulosCreados: Articulo[] = []

        for (const articulo of articulosImportados) {
          const creado = await crearArticulo(articulo)
          articulosCreados.push({
            ...creado,
            updatedAt: creado.updatedAt.toISOString(),
          })
        }

        resolve(articulosCreados)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = (error) => reject(error)
    reader.readAsArrayBuffer(file)
  })
}
