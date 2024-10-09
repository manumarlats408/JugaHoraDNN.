import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://jugahora.com.ar/restablecer-contrasena',
    })

    if (error) {
      console.error('Error al enviar el correo de restablecimiento:', error)
      return new Response(JSON.stringify({ error: 'Error al procesar la solicitud' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ message: 'Correo de restablecimiento enviado' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error inesperado:', error)
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}