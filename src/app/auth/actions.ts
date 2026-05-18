'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect(`/auth/login?message=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/profiles')
}

export async function signup(formData: FormData) {
  const supabase = createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = formData.get('username') as string

  // First, attempt signup normally
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  })

  if (error) {
    // "User already registered" — the user exists in Supabase Auth but may
    // have been deleted from the profiles table or the dashboard.
    // We surface a clear, friendly message instead of a cryptic error.
    if (
      error.message.toLowerCase().includes('already registered') ||
      error.message.toLowerCase().includes('already been registered') ||
      error.message.toLowerCase().includes('user already exists')
    ) {
      redirect(
        `/auth/signup?message=${encodeURIComponent(
          'Este email ya está registrado. Si olvidaste tu contraseña, inicia sesión o usa la opción de recuperación.'
        )}`
      )
    }

    redirect(`/auth/signup?message=${encodeURIComponent(error.message)}`)
  }

  // Supabase sometimes returns a user with identities=[] when the email is
  // already confirmed (soft-deleted scenario). Detect and inform the user.
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    redirect(
      `/auth/signup?message=${encodeURIComponent(
        'Este email ya está en uso. Si borraste tu cuenta, contacta al soporte o usa un email diferente.'
      )}`
    )
  }

  revalidatePath('/', 'layout')
  redirect('/profiles')
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/auth/login')
}

export async function requestPasswordReset(formData: FormData) {
  const supabase = createClient()
  const email = formData.get('email') as string

  if (!email) {
    redirect(`/auth/forgot-password?error=${encodeURIComponent('Por favor ingresa tu correo electrónico.')}`)
  }

  const headersList = headers()
  const host = headersList.get('host')
  const protocol = headersList.get('x-forwarded-proto') ?? (host?.includes('localhost') ? 'http' : 'https')
  const origin = `${protocol}://${host}`

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
  })

  if (error) {
    redirect(`/auth/forgot-password?error=${encodeURIComponent(error.message)}`)
  }

  redirect(`/auth/forgot-password?success=${encodeURIComponent('success')}`)
}

export async function updatePassword(formData: FormData) {
  const supabase = createClient()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || password !== confirmPassword) {
    redirect(`/auth/reset-password?error=${encodeURIComponent('Las contraseñas no coinciden.')}`)
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    redirect(`/auth/reset-password?error=${encodeURIComponent(error.message)}`)
  }

  redirect(`/auth/reset-password?success=${encodeURIComponent('success')}`)
}
