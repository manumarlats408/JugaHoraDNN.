"use client";

import { useState } from "react";

export default function AgregarMovimientoDialog({ onAdded }: { onAdded: () => void }) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    concepto: "",
    metodoPago: "efectivo",
    ingreso: 0,
    egreso: 0,
    fecha: "",
  });

  const handleSubmit = async () => {
    await fetch("/api/movimientos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShow(false);
    setForm({ concepto: "", metodoPago: "efectivo", ingreso: 0, egreso: 0, fecha: "" });
    onAdded();
  };

  return (
    <div>
      <button onClick={() => setShow(true)} className="bg-blue-600 text-white px-3 py-1 rounded">
        Agregar Movimiento
      </button>
      {show && (
        <div className="mt-4 space-y-2">
          <input
            placeholder="Concepto"
            value={form.concepto}
            onChange={(e) => setForm({ ...form, concepto: e.target.value })}
          />
          <select
            value={form.metodoPago}
            onChange={(e) => setForm({ ...form, metodoPago: e.target.value })}
          >
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
          </select>
          <input
            type="number"
            placeholder="Ingreso"
            value={form.ingreso}
            onChange={(e) => setForm({ ...form, ingreso: Number(e.target.value) })}
          />
          <input
            type="number"
            placeholder="Egreso"
            value={form.egreso}
            onChange={(e) => setForm({ ...form, egreso: Number(e.target.value) })}
          />
          <input
            type="date"
            value={form.fecha}
            onChange={(e) => setForm({ ...form, fecha: e.target.value })}
          />
          <button onClick={handleSubmit} className="bg-green-600 text-white px-3 py-1 rounded">
            Guardar
          </button>
        </div>
      )}
    </div>
  );
}
