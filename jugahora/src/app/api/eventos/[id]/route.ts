import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);

  try {
    const data = await req.json();
    const {
      nombre,
      date,
      startTime,
      endTime,
      categoria,
      genero,
      tipo,
      maxParejas,
      formato,
    } = data;

    const eventoActualizado = await prisma.evento_club.update({
      where: { id },
      data: {
        nombre,
        date: new Date(date),
        startTime,
        endTime,
        categoria,
        genero,
        tipo,
        maxParejas: Number(maxParejas),
        ...(tipo === "torneo" && { formato }),
      },
    });

    return NextResponse.json(eventoActualizado);
  } catch (error) {
    console.error("Error al actualizar evento:", error);
    return NextResponse.json({ error: "Error al actualizar evento" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);

  try {
    await prisma.evento_club.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Evento eliminado" });
  } catch (error) {
    console.error("Error al eliminar evento:", error);
    return NextResponse.json({ error: "Error al eliminar evento" }, { status: 500 });
  }
}
