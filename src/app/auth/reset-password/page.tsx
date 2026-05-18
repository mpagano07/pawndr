"use client"

import { updatePassword } from '../actions'
import { PawPrint, Lock, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/i18n/LanguageProvider'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { LoadingButton } from '@/components/ui/LoadingButton'
import { createClient } from '@/utils/supabase/client'

export default function ResetPasswordPage() {
  const dict = useTranslation()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const success = searchParams.get('success')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    // Al instanciar el cliente en el navegador, @supabase/ssr procesa y almacena
    // automáticamente los tokens de recuperación presentes en la URL (#access_token o ?code)
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log('Sesión de recuperación establecida.')
      }
    })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background px-4">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-500/20 blur-[120px] pointer-events-none" />

      <div className="glass p-8 rounded-3xl w-full max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-2">
            <PawPrint className="text-primary w-8 h-8" />
            <span className="text-gradient font-bold text-2xl tracking-tight">Pawndr</span>
          </Link>
        </div>

        {success ? (
          <div className="text-center py-6 flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center border border-green-500/20 mb-2">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">{dict.auth.updatePassword}</h2>
            <p className="text-white/70 text-sm leading-relaxed max-w-sm">
              {dict.auth.passwordUpdatedSuccess}
            </p>
            <Link
              href="/profiles"
              className="mt-6 w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
            >
              Continuar a Pawndr
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold mb-2">{dict.auth.resetPasswordTitle}</h2>
              <p className="text-white/60 text-sm max-w-sm mx-auto leading-relaxed">
                Ingresa y confirma tu nueva contraseña para tu cuenta.
              </p>
            </div>

            <form className="flex flex-col gap-4">
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-white/40" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder={dict.auth.newPassword}
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white placeholder:text-white/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-3 top-3.5 text-white/40 hover:text-white/80 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-white/40" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder={dict.auth.confirmPassword}
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white placeholder:text-white/40"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm text-center bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                  {error}
                </p>
              )}

              <LoadingButton
                formAction={updatePassword}
                label={dict.auth.updatePassword}
                loadingLabel={dict.auth.updating}
              />
            </form>
          </>
        )}
      </div>
    </div>
  )
}
