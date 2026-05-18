"use client"

import { requestPasswordReset } from '../actions'
import { PawPrint, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/i18n/LanguageProvider'
import { useSearchParams } from 'next/navigation'
import { LoadingButton } from '@/components/ui/LoadingButton'

export default function ForgotPasswordPage() {
  const dict = useTranslation()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const success = searchParams.get('success')

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
            <h2 className="text-2xl font-bold">{dict.auth.resetPasswordTitle}</h2>
            <p className="text-white/70 text-sm leading-relaxed max-w-sm">
              {dict.auth.resetEmailSent}
            </p>
            <Link
              href="/auth/login"
              className="mt-6 w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
            >
              <ArrowLeft className="w-4 h-4" />
              {dict.auth.backToLogin}
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold mb-2">{dict.auth.resetPasswordTitle}</h2>
              <p className="text-white/60 text-sm max-w-sm mx-auto leading-relaxed">
                {dict.auth.resetPasswordDesc}
              </p>
            </div>

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

              {error && (
                <p className="text-red-400 text-sm text-center bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                  {error}
                </p>
              )}

              <LoadingButton
                formAction={requestPasswordReset}
                label={dict.auth.sendRecoveryLink}
                loadingLabel={dict.auth.sending}
              />
            </form>

            <div className="mt-8 text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {dict.auth.backToLogin}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
