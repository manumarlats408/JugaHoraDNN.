import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'
import jwt from 'jsonwebtoken'

export async function verifyAuth(cookies: ReadonlyRequestCookies): Promise<number | null> {
    const token = cookies.get('auth_token')?.value
  
    if (!token) {
      console.log('No se encontró token de autenticación')
      return null
    }
  
    try {
      console.log('Intentando verificar token')
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number }
      console.log('Token verificado exitosamente, userId:', decoded.userId)
      return decoded.userId
    } catch (error) {
      console.error('Error al verificar token:', error)
      return null
    }
  }