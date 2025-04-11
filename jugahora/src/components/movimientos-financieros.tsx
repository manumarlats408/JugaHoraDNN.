"use client";

import { useState, useEffect } from "react";
import AgregarMovimientoDialog from "./agregar-movimiento-dialog";
import { MovimientoFinanciero } from "@/lib/tipos"

export default function MovimientosFinancieros() {
  const [movimientos, setMovimientos] = useState<MovimientoFinanciero[]>([])
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  useEffect(() => {
    if (desde && hasta) {
      fetch(`/api/movimientos?desde=${desde}&hasta=${hasta}`)
        .then((res) => res.json())
        .then((data) => setMovimientos(data));
    }
  }, [desde, hasta]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Movimientos Financieros</h1>

      <div className="flex gap-4">
        <div>
          <label>Desde:</label>
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        <div>
          <label>Hasta:</label>
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
      </div>

      <AgregarMovimientoDialog onAdded={() => desde && hasta && fetch(`/api/movimientos?desde=${desde}&hasta=${hasta}`).then(res => res.json()).then(setMovimientos)} />

      <table className="w-full mt-4 border">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Concepto</th>
            <th>Método de pago</th>
            <th>Ingreso</th>
            <th>Egreso</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.map((m) => (
            <tr key={m.id}>
              <td>{new Date(m.fechaMovimiento).toLocaleDateString()}</td>
              <td>{m.concepto}</td>
              <td>{m.metodoPago}</td>
              <td>${m.ingreso}</td>
              <td>${m.egreso}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
