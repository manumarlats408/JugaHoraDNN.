import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      nombre,
      date,
      startTime,
      endTime,
      clubId,
      categoria,
      genero,
      tipo,
      maxParejas,
      formato,
      price,
    } = data;

    const nuevoEvento = await prisma.evento_club.create({
      data: {
        nombre,
        date: new Date(date),
        startTime,
        endTime,
        categoria,
        genero,
        tipo,
        maxParejas: Number(maxParejas),
        price: parseFloat(price),
        ...(tipo === "torneo" && { formato }),
        Club: {
          connect: { id: clubId }
        }
      },
    })
    

    return NextResponse.json(nuevoEvento, { status: 201 });
  } catch (error) {
    console.error("Error al crear evento:", error);
    return NextResponse.json({ error: "Error al crear el evento" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const clubId = searchParams.get("clubId");

  if (!clubId) {
    return NextResponse.json({ error: "Falta el clubId" }, { status: 400 });
  }

  try {
    const eventos = await prisma.evento_club.findMany({
      where: { clubId: Number(clubId) },
      orderBy: { date: "asc" },
    });

    return NextResponse.json(eventos);
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    return NextResponse.json({ error: "Error al obtener eventos" }, { status: 500 });
  }
}
