import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const test = await prisma.$queryRaw`SELECT 1`;
        console.log("Conexión Prisma exitosa:", test);
        return NextResponse.json({ message: "Conexión Prisma exitosa", result: test });
    } catch (error) {
        console.error("Error en la conexión con Prisma:", error);
        return NextResponse.json({ error: "Error en la conexión con Prisma", details: error }, { status: 500 });
    }
}
