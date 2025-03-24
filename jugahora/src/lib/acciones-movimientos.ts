"use server"

import { revalidatePath } from "next/cache"
import { crearMovimiento as crearMovimientoDB } from "@/lib/db-movimientos"
import type { Movimiento } from "@/lib/tipos"

export async function crearMovimiento(movimientoData: Omit<Movimiento, "id">) {
  try {
    await crearMovimientoDB(movimientoData)
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error al crear movimiento:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al crear el movimiento",
    }
  }
}

