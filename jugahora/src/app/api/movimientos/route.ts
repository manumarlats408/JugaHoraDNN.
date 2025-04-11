import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

function getClubIdFromToken(request: NextRequest): number | null {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; isClub: boolean };
    if (!decoded.isClub) return null;
    return decoded.id;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const clubId = getClubIdFromToken(request);
  if (!clubId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const desde = searchParams.get("desde");
  const hasta = searchParams.get("hasta");

  if (!desde || !hasta)
    return NextResponse.json({ error: "Faltan fechas" }, { status: 400 });

  const movimientos = await prisma.movimientoFinanciero.findMany({
    where: {
      clubId,
      fechaMovimiento: {
        gte: new Date(desde),
        lte: new Date(hasta + "T23:59:59"),
      },
    },
    orderBy: { fechaMovimiento: "desc" },
  });

  return NextResponse.json(movimientos);
}

export async function POST(request: NextRequest) {
  const clubId = getClubIdFromToken(request);
  if (!clubId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { concepto, metodoPago, ingreso, egreso, fecha } = await request.json();

  if (!concepto || !metodoPago || !fecha)
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });

  const movimiento = await prisma.movimientoFinanciero.create({
    data: {
      clubId,
      concepto,
      metodoPago,
      ingreso: ingreso || 0,
      egreso: egreso || 0,
      fechaMovimiento: new Date(fecha),
    },
  });

  return NextResponse.json(movimiento);
}
