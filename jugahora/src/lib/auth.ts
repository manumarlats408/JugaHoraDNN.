import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'
import jwt from 'jsonwebtoken'

export async function verifyAuth(cookies: ReadonlyRequestCookies): Promise<string | null> {
  const token = cookies.get('auth_token')?.value

  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    return decoded.userId
  } catch (error) {
    console.error('Error verifying token:', error)
    return null
  }
}