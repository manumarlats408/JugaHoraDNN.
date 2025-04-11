"use client"

import { useState } from "react"

type Props = {
  onSuccess: () => void
}

export default function AgregarMovimientoDialog({ onSuccess }: Props) {
  const [open, setOpen] = useState(false)
  const [concepto, setConcepto] = useState("")
  const [fechaMovimiento, setFechaMovimiento] = useState("")
  const [ingreso, setIngreso] = useState<number | null>(null)
  const [egreso, setEgreso] = useState<number | null>(null)
  const [metodoPago, setMetodoPago] = useState("")

  const handleSubmit = async () => {
    const res = await fetch("/api/movimientos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        concepto,
        fechaMovimiento,
        ingreso,
        egreso,
        metodoPago,
      }),
    })
  
    const data = await res.json()
  
    if (res.ok) {
      setOpen(false)
      setConcepto("")
      setFechaMovimiento("")
      setIngreso(null)
      setEgreso(null)
      setMetodoPago("")
      onSuccess()
    } else {
      alert(`Error al guardar el movimiento: ${data.error || "Error desconocido"}`)
      console.error("Error al guardar movimiento:", data)
    }
  }
  

  return (
    <div>
      <button onClick={() => setOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Agregar movimiento
      </button>

      {open && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md w-96 space-y-4">
            <h3 className="text-lg font-bold">Nuevo Movimiento</h3>

            <input
              type="text"
              placeholder="Concepto"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              className="w-full border px-2 py-1"
            />

            <input
              type="date"
              value={fechaMovimiento}
              onChange={(e) => setFechaMovimiento(e.target.value)}
              className="w-full border px-2 py-1"
            />

            <input
              type="number"
              placeholder="Ingreso"
              value={ingreso ?? ""}
              onChange={(e) => setIngreso(Number(e.target.value) || null)}
              className="w-full border px-2 py-1"
            />

            <input
              type="number"
              placeholder="Egreso"
              value={egreso ?? ""}
              onChange={(e) => setEgreso(Number(e.target.value) || null)}
              className="w-full border px-2 py-1"
            />

            <input
              type="text"
              placeholder="Método de pago"
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="w-full border px-2 py-1"
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="px-4 py-1 border rounded">
                Cancelar
              </button>
              <button onClick={handleSubmit} className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
