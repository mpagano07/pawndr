'use client'

import { useState, useTransition } from 'react'
import { X, Loader2, Heart, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { sendAdoptionRequest } from '@/app/adopt/actions'

interface AdoptionRequestModalProps {
  petId: string
  petName: string
  ownerId: string
  onClose: () => void
}

type HousingType = 'apartment' | 'house' | 'farm' | 'other'

const HOUSING_OPTIONS: { value: HousingType; label: string; icon: string }[] = [
  { value: 'apartment', label: 'Departamento', icon: '🏢' },
  { value: 'house', label: 'Casa con patio', icon: '🏡' },
  { value: 'farm', label: 'Chacra/Campo', icon: '🌾' },
  { value: 'other', label: 'Otro', icon: '🏠' },
]

export function AdoptionRequestModal({
  petId,
  petName,
  ownerId,
  onClose,
}: AdoptionRequestModalProps) {
  const [housing, setHousing] = useState<HousingType>('apartment')
  const [isPending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('pet_id', petId)
    fd.set('owner_id', ownerId)
    fd.set('housing_type', housing)

    startTransition(async () => {
      const result = await sendAdoptionRequest(fd)
      if (result?.error) {
        toast.error(result.error)
      } else {
        setSent(true)
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md bg-zinc-900 border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-white/8">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold">Quiero adoptar</h2>
              <p className="text-white/50 text-sm mt-0.5">a {petName} 🐾</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {sent ? (
          /* Success state */
          <div className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-amber-400 fill-amber-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">¡Solicitud enviada! 🎉</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              Nos comunicaremos con el dueño de {petName}. Recibirás una respuesta pronto.
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full py-3 bg-amber-500 text-amber-950 font-bold rounded-xl hover:bg-amber-400 transition-all"
            >
              Entendido
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
            {/* Teléfono de contacto */}
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider font-semibold flex items-center gap-1.5 mb-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Teléfono / WhatsApp de contacto <span className="text-red-400">*</span></span>
              </label>
              <input
                required
                name="phone"
                type="tel"
                placeholder="Ej: +54 9 11 1234-5678"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:ring-2 focus:ring-amber-500/50 outline-none"
              />
            </div>

            {/* Experiencia */}
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider font-semibold block mb-1.5">
                ¿Tuviste mascotas antes?
              </label>
              <textarea
                name="experience"
                placeholder="Ej: Tuve un golden retriever durante 10 años, tengo experiencia con perros..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:ring-2 focus:ring-amber-500/50 outline-none resize-none h-20"
              />
            </div>

            {/* Tipo de vivienda */}
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider font-semibold block mb-2">
                Tipo de vivienda
              </label>
              <div className="grid grid-cols-2 gap-2">
                {HOUSING_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setHousing(opt.value)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                      housing === opt.value
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                        : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                    }`}
                  >
                    <span className="text-lg">{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Otras mascotas */}
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider font-semibold block mb-1.5">
                ¿Tenés otras mascotas actualmente?
              </label>
              <input
                name="other_pets"
                type="text"
                placeholder="Ej: Un gato de 3 años, muy tranquilo"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:ring-2 focus:ring-amber-500/50 outline-none"
              />
            </div>

            {/* Mensaje */}
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider font-semibold block mb-1.5">
                Mensaje para el dueño/refugio <span className="text-white/30">(opcional)</span>
              </label>
              <textarea
                name="message"
                placeholder={`Cuéntale algo especial sobre por qué querés adoptar a ${petName}...`}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:ring-2 focus:ring-amber-500/50 outline-none resize-none h-24"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-4 bg-amber-500 text-amber-950 font-bold rounded-xl hover:bg-amber-400 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20 text-base"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Heart className="w-5 h-5" />
              )}
              Enviar solicitud de adopción
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
