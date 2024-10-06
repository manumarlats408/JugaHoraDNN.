import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  // Si no hay token y la ruta es /menu, redirige al login
  if (!token && request.nextUrl.pathname === '/menu') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si hay token, permite el acceso a /menu
  if (token && request.nextUrl.pathname === '/menu') {
    return NextResponse.next()
  }

  // Para todas las demás rutas, permite el acceso
  return NextResponse.next()
}

export const config = {
  matcher: ['/menu']
}