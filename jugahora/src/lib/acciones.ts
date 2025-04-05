"use server"

import { revalidatePath } from "next/cache"
import { actualizarArticuloDB } from "@/lib/db"
import type { Articulo } from "@/lib/tipos"

export async function actualizarArticulo(articulo: Articulo) {
  try {
    await actualizarArticuloDB(articulo.id, articulo)
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error al actualizar artículo:", error)
    return { success: false, error: "Error al actualizar el artículo" }
  }
}

export async function importarArticulos(formData: FormData) {
  try {
    const url = `${window.location.origin}/api/importar-articulos`
    
    const respuesta = await fetch(url, {
      method: "POST",
      body: formData,
    })

    if (!respuesta.ok) {
      const error = await respuesta.text()
      return { success: false, error }
    }

    const data = await respuesta.json()
    return { success: true, data }

  } catch (error: unknown) {
    console.error("Error en importarArticulos:", error)
  
    const mensaje = error instanceof Error ? error.message : "Error desconocido"
    return { success: false, error: mensaje }
  }
  
}



export async function exportarArticulos() {
  try {
    const respuesta = await fetch("/api/exportar-articulos")

    if (!respuesta.ok) {
      const error = await respuesta.json()
      throw new Error(error.error || "Error al exportar artículos")
    }

    // Obtener el blob y crear un enlace de descarga
    const blob = await respuesta.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "articulos.xlsx"
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    return { success: true }
  } catch (error) {
    console.error("Error al exportar artículos:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al exportar artículos",
    }
  }
}

