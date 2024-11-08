import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'
import jwt from 'jsonwebtoken'

export async function verifyAuth(cookies: ReadonlyRequestCookies): Promise<number | null> {
  console.log('Iniciando verifyAuth')
  const token = cookies.get('auth_token')?.value

  if (!token) {
    console.log('No se encontró token de autenticación')
    return null
  }

  console.log('Token encontrado:', token.substring(0, 10) + '...')

  try {
    console.log('Intentando verificar token con JWT_SECRET:', process.env.JWT_SECRET?.substring(0, 5) + '...')
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number }
    console.log('Token verificado exitosamente, userId:', decoded.userId)
    return decoded.userId
  } catch (error) {
    console.error('Error al verificar token:', error)
    return null
  }
}