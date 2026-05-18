"use client"

import { login } from '../actions'
import { PawPrint, Mail, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/i18n/LanguageProvider'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { LoadingButton } from '@/components/ui/LoadingButton'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const dict = useTranslation()
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState(false)

  useEffect(() => {
    const errorCode = searchParams.get('error_code')
    const errorDesc = searchParams.get('error_description')
    const hash = window.location.hash

    if (
      errorCode === 'otp_expired' ||
      hash.includes('otp_expired') ||
      hash.includes('expired') ||
      (errorDesc && errorDesc.toLowerCase().includes('expired'))
    ) {
      setAuthError(true)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background px-4">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-500/20 blur-[120px] pointer-events-none" />

      {authError && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-12 left-4 right-4 z-50 max-w-xl mx-auto"
        >
          <div className="glass p-6 rounded-2xl border border-red-500/30 bg-red-500/10 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center shrink-0 border border-red-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg text-white">Enlace de recuperación caducado</h4>
              <p className="text-sm text-white/70 mt-1 leading-relaxed">
                El enlace de un solo uso ya expiró. Esto ocurre si los sistemas de seguridad de tu correo hacen un análisis de los enlaces.
              </p>
            </div>
            <Link
              href="/auth/forgot-password"
              className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all shrink-0 whitespace-nowrap"
            >
              Solicitar nuevo enlace
            </Link>
          </div>
        </motion.div>
      )}

      <div className="glass p-8 rounded-3xl w-full max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-2">
            <PawPrint className="text-primary w-8 h-8" />
            <span className="text-gradient font-bold text-2xl tracking-tight">Pawndr</span>
          </Link>
        </div>

        <h2 className="text-2xl font-bold text-center mb-8">{dict.common.welcomeBack}</h2>

        <form className="flex flex-col gap-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-white/40" />
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder={dict.common.email}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white placeholder:text-white/40"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-white/40" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder={dict.common.password}
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

          <div className="flex justify-end -mt-1 mb-1">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary/80 hover:text-primary transition-colors hover:underline"
            >
              {dict.auth.forgotPassword}
            </Link>
          </div>

          {message && (
            <p className="text-red-400 text-sm text-center bg-red-400/10 p-3 rounded-lg border border-red-400/20">
              {message}
            </p>
          )}

          <LoadingButton
            formAction={login}
            label={dict.common.login}
            loadingLabel="Iniciando sesión..."
          />
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase font-medium">
            <span className="bg-black/40 px-4 py-1 rounded-full text-white/40 backdrop-blur-md">
              {dict.common.orContinueWith}
            </span>
          </div>
        </div>

        <GoogleSignInButton />

        <p className="text-center text-white/60 mt-6">
          {dict.common.noAccount}{' '}
          <Link href="/auth/signup" className="text-primary font-semibold hover:underline">
            {dict.common.signup}
          </Link>
        </p>
      </div>
    </div>
  )
}
