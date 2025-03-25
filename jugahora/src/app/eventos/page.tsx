"use client"

import { useState, ChangeEvent, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "react-hot-toast"

export default function CrearEventoPage() {
  const [form, setForm] = useState({
    nombre: "",
    date: "",
    startTime: "",
    endTime: "",
    categoria: "",
    genero: "mixto",
    tipo: "cancha_abierta",
    maxParejas: 4,
    formato: "",
  })

  const router = useRouter()

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === "maxParejas" ? parseInt(value) : value,
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    try {
      const clubRes = await fetch("/api/auth", { credentials: "include" })
      const clubData = await clubRes.json()

      const response = await fetch("/api/eventos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          clubId: clubData.entity.id,
        }),
      })

      if (response.ok) {
        toast.success("Evento creado con éxito")
        router.push("/club-dashboard")
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al crear evento")
      }
    } catch (err) {
      console.error(err)
      toast.error("Error inesperado")
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded mt-8">
      <h2 className="text-2xl font-bold mb-4">Crear Nuevo Evento</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="nombre">Nombre del Evento</Label>
          <Input name="nombre" onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="date">Fecha</Label>
          <Input type="date" name="date" onChange={handleChange} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Hora de Inicio</Label>
            <Input type="time" name="startTime" onChange={handleChange} required />
          </div>
          <div>
            <Label>Hora de Fin</Label>
            <Input type="time" name="endTime" onChange={handleChange} required />
          </div>
        </div>
        <div>
          <Label>Categoría</Label>
          <Input name="categoria" placeholder="Ej: 4" onChange={handleChange} required />
        </div>
        <div>
          <Label>Género</Label>
          <select name="genero" onChange={handleChange} className="w-full border p-2 rounded">
            <option value="mixto">Mixto</option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
          </select>
        </div>
        <div>
          <Label>Tipo de Evento</Label>
          <select name="tipo" onChange={handleChange} className="w-full border p-2 rounded">
            <option value="cancha_abierta">Cancha Abierta</option>
            <option value="torneo">Torneo</option>
          </select>
        </div>
        <div>
          <Label>Cantidad de Parejas</Label>
          <Input
            type="number"
            name="maxParejas"
            onChange={handleChange}
            value={form.maxParejas}
            min={1}
            required
          />
        </div>
        {form.tipo === "torneo" && (
          <div>
            <Label>Formato del Torneo</Label>
            <select name="formato" onChange={handleChange} className="w-full border p-2 rounded">
              <option value="eliminacion_directa">Eliminación Directa</option>
              <option value="grupos">Grupos</option>
            </select>
          </div>
        )}
        <Button type="submit">Crear Evento</Button>
      </form>
    </div>
  )
}
