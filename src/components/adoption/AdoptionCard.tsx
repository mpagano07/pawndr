'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, Bookmark, Eye, MapPin, AlertCircle, PawPrint, PartyPopper } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { toggleFavorite } from '@/app/adopt/actions'
import { ShelterBadge } from './ShelterBadge'
import type { AdoptionPet } from '@/types'

interface AdoptionCardProps {
  pet: AdoptionPet & { images?: { image_url: string; position: number }[]; shelter?: any }
  isFavorited?: boolean
}

const SPECIES_EMOJI: Record<string, string> = {
  dog: '🐕', cat: '🐈', rabbit: '🐇', bird: '🦜', other: '🐾',
}

function formatAge(age: number | null, unit: string) {
  if (age == null) return null
  if (unit === 'months') {
    if (age < 12) return `${age} mes${age === 1 ? '' : 'es'}`
    const yrs = Math.floor(age / 12)
    return `${yrs} año${yrs === 1 ? '' : 's'}`
  }
  return `${age} año${age === 1 ? '' : 's'}`
}

export function AdoptionCard({ pet, isFavorited = false }: AdoptionCardProps) {
  const [favorited, setFavorited] = useState(isFavorited)
  const [isPending, startTransition] = useTransition()

  const mainImage = pet.images?.sort((a, b) => a.position - b.position)[0]?.image_url
  const ageStr = formatAge(pet.age, pet.age_unit)
  const isPuppy = pet.age_unit === 'months' ? (pet.age ?? 0) < 12 : (pet.age ?? 99) < 1
  const isSenior = pet.age_unit === 'months' ? (pet.age ?? 0) >= 96 : (pet.age ?? 0) >= 8

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const result = await toggleFavorite(pet.id)
      if ('error' in result && result.error) {
        toast.error(result.error)
      } else {
        const nowFav = 'favorited' in result ? result.favorited : !favorited
        setFavorited(nowFav ?? !favorited)
        toast.success(nowFav ? '⭐ Guardado en favoritos' : 'Eliminado de favoritos')
      }
    })
  }

  return (
    <div className="group relative rounded-3xl overflow-hidden bg-zinc-900 border border-white/8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={pet.name}
            fill
            sizes="(max-width: 640px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/30 to-zinc-900 flex items-center justify-center">
            <PawPrint className="w-16 h-16 text-white/10" />
          </div>
        )}

        {/* Adopted overlay */}
        {pet.adoption_status === 'adopted' && (
          <div className="absolute inset-0 z-20 bg-emerald-950/85 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/30 mb-3 shadow-lg shadow-emerald-500/20 animate-pulse">
              <PartyPopper className="w-8 h-8 text-emerald-400" />
            </div>
            <span className="text-xl font-black text-emerald-300 uppercase tracking-widest text-shadow-lg">
              ¡Mascota Adoptada!
            </span>
            <p className="text-xs text-emerald-100/70 mt-1 max-w-[180px]">
              Encontró un nuevo hogar lleno de amor 🏡❤️
            </p>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

        {/* Top badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-30">
          {pet.urgent && pet.adoption_status !== 'adopted' && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg">
              <AlertCircle className="w-3 h-3" />
              URGENTE
            </span>
          )}
          {isPuppy && (
            <span className="px-2 py-0.5 bg-amber-500/90 text-amber-950 text-[10px] font-black uppercase tracking-wider rounded-full">
              🐣 Cachorro
            </span>
          )}
          {isSenior && (
            <span className="px-2 py-0.5 bg-purple-500/90 text-white text-[10px] font-black uppercase tracking-wider rounded-full">
              👴 Senior
            </span>
          )}
          {pet.vaccinated && (
            <span className="px-2 py-0.5 bg-emerald-500/90 text-white text-[10px] font-bold rounded-full">
              ✅ Vacunado
            </span>
          )}
        </div>

        {/* Favorite button */}
        <button
          onClick={handleFavorite}
          disabled={isPending}
          aria-label={favorited ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          className="absolute top-2.5 right-2.5 p-2 bg-black/50 backdrop-blur-md rounded-full border border-white/10 hover:scale-110 active:scale-95 transition-all z-30"
        >
          <Bookmark
            className={`w-4 h-4 transition-colors ${favorited ? 'fill-amber-400 text-amber-400' : 'text-white/70'}`}
          />
        </button>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-30">
          <h3 className="font-bold text-white text-base leading-tight">
            {SPECIES_EMOJI[pet.species] || '🐾'} {pet.name}
            {ageStr && <span className="font-normal text-white/70 text-sm">, {ageStr}</span>}
          </h3>
          {pet.city && (
            <p className="flex items-center gap-1 text-white/50 text-[11px] mt-0.5">
              <MapPin className="w-3 h-3" />
              {pet.city}
            </p>
          )}
          {/* Shelter badge */}
          {pet.shelter && (
            <div className="mt-2">
              <ShelterBadge shelter={pet.shelter} size="sm" />
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center divide-x divide-white/8">
        {pet.adoption_status === 'adopted' ? (
          <div className="flex-1 text-center py-3 text-emerald-400 font-bold text-xs bg-emerald-500/10 tracking-wide uppercase">
            💚 Proceso de adopción finalizado
          </div>
        ) : (
          <>
            <Link
              href={`/adopt/${pet.id}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 text-white/70 hover:text-white hover:bg-white/5 transition-all text-xs font-semibold"
            >
              <Eye className="w-4 h-4" />
              Ver perfil
            </Link>
            <Link
              href={`/adopt/${pet.id}?action=request`}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-all text-xs font-semibold"
            >
              <Heart className="w-4 h-4" />
              Me interesa
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
