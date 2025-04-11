// src/app/components/AgregarMovimientoDialog.tsx
"use client"

import { useState } from "react"

export default function AgregarMovimientoDialog({
  clubId,
  onSuccess,
}: {
  clubId: number
  onSuccess: () => void
}) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    concepto: "",
    jugador: "",
    metodoPago: "Efectivo",
    ingreso: "",
    egreso: "",
    fechaMovimiento: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch("/api/movimientos", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        ingreso: form.ingreso ? parseFloat(form.ingreso) : null,
        egreso: form.egreso ? parseFloat(form.egreso) : null,
        clubId,
      }),
    })
    if (res.ok) {
      onSuccess()
      setOpen(false)
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="bg-blue-600 text-white px-3 py-1 rounded">+ Agregar</button>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Agregar Movimiento</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required type="text" placeholder="Concepto" value={form.concepto} onChange={(e) => setForm({ ...form, concepto: e.target.value })} className="w-full border p-2 rounded" />
              <input type="text" placeholder="Jugador" value={form.jugador} onChange={(e) => setForm({ ...form, jugador: e.target.value })} className="w-full border p-2 rounded" />
              <input type="date" required value={form.fechaMovimiento} onChange={(e) => setForm({ ...form, fechaMovimiento: e.target.value })} className="w-full border p-2 rounded" />
              <select value={form.metodoPago} onChange={(e) => setForm({ ...form, metodoPago: e.target.value })} className="w-full border p-2 rounded">
                <option value="Efectivo">Efectivo</option>
                <option value="MercadoPago">MercadoPago</option>
                <option value="Transferencia">Transferencia</option>
              </select>
              <input type="number" step="0.01" placeholder="Ingreso" value={form.ingreso} onChange={(e) => setForm({ ...form, ingreso: e.target.value })} className="w-full border p-2 rounded" />
              <input type="number" step="0.01" placeholder="Egreso" value={form.egreso} onChange={(e) => setForm({ ...form, egreso: e.target.value })} className="w-full border p-2 rounded" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className="text-gray-500">Cancelar</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
