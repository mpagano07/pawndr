import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/profiles'
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  if (error) {
    return NextResponse.redirect(
      `${origin}/auth/login?message=${encodeURIComponent(error_description ?? error)}`
    )
  }

  if (code) {
    const supabase = createClient()
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
    if (!sessionError) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    return NextResponse.redirect(
      `${origin}/auth/login?message=${encodeURIComponent(sessionError.message)}`
    )
  }

  // Si no hay código pero tenemos un destino específico como /auth/reset-password
  // Es posible que Supabase haya retornado la sesión en el hash fragment (#access_token=...)
  // Redirigimos a la ruta para que el cliente Supabase del navegador pueda capturar la sesión.
  if (next && next !== '/profiles') {
    return NextResponse.redirect(`${origin}${next}`)
  }

  return NextResponse.redirect(
    `${origin}/auth/login?message=${encodeURIComponent('No se pudo autenticar con Google o el enlace ha expirado.')}`
  )
}
