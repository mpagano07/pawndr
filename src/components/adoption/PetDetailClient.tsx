'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, Bookmark, MapPin, ArrowLeft, ExternalLink, BadgeCheck, ChevronLeft, ChevronRight, PawPrint, PartyPopper } from 'lucide-react'
import { AdoptionRequestModal } from '@/components/adoption/AdoptionRequestModal'
import { ShelterBadge } from '@/components/adoption/ShelterBadge'
import { toggleFavorite } from '@/app/adopt/actions'
import { toast } from 'sonner'

interface PetDetailClientProps {
  pet: any
  isFavorited: boolean
  openRequest?: boolean
}

const ENERGY_LABELS = ['', 'Muy tranquilo', 'Tranquilo', 'Moderado', 'Activo', 'Muy activo']
const ENERGY_COLORS = ['', 'bg-blue-500', 'bg-teal-500', 'bg-green-500', 'bg-amber-500', 'bg-red-500']
const SIZE_LABELS: Record<string, string> = {
  small: 'Pequeño', medium: 'Mediano', large: 'Grande', xlarge: 'Extra grande',
}
const SPECIES_EMOJI: Record<string, string> = {
  dog: '🐕', cat: '🐈', rabbit: '🐇', bird: '🦜', other: '🐾',
}

function Badge({ active, label, icon }: { active: boolean; label: string; icon: string }) {
  if (!active) return null
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/8 border border-white/10 text-sm text-white/80 font-medium">
      <span>{icon}</span>{label}
    </span>
  )
}

export function PetDetailClient({ pet, isFavorited, openRequest = false }: PetDetailClientProps) {
  const [favorited, setFavorited] = useState(isFavorited)
  const [showRequest, setShowRequest] = useState(openRequest)
  const [activePhoto, setActivePhoto] = useState(0)

  const images = pet.images?.sort((a: any, b: any) => a.position - b.position) ?? []

  const ageStr = pet.age
    ? pet.age_unit === 'months' && pet.age < 12
      ? `${pet.age} meses`
      : `${pet.age_unit === 'months' ? Math.floor(pet.age / 12) : pet.age} año${(pet.age_unit === 'months' ? Math.floor(pet.age / 12) : pet.age) !== 1 ? 's' : ''}`
    : null

  const handleFavorite = async () => {
    const result = await toggleFavorite(pet.id)
    if ('error' in result && result.error) {
      toast.error(result.error)
    } else {
      const nowFav = 'favorited' in result ? result.favorited : !favorited
      setFavorited(nowFav ?? !favorited)
      toast.success(nowFav ? '⭐ Guardado en favoritos' : 'Eliminado de favoritos')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── HERO: immersive full-proportioned image gallery ── */}
      <div className="relative w-full h-[55vh] max-h-[550px] min-h-[400px] overflow-hidden bg-black">
        {images.length > 0 ? (
          <>
            {/* Blurred background layer for immersive matching color without black bars */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <Image
                key={`blur-${activePhoto}`}
                src={images[activePhoto].image_url}
                alt=""
                fill
                sizes="100vw"
                className="object-cover opacity-40 blur-2xl scale-125"
              />
            </div>

            {/* Sharp foreground layer displaying full uncropped photo */}
            <div className="absolute inset-0">
              <Image
                key={activePhoto}
                src={images[activePhoto].image_url}
                alt={pet.name}
                fill
                priority
                sizes="(max-width: 640px) 100vw, 640px"
                className="object-contain"
              />
            </div>
            {/* Dark gradient for top/bottom button readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />

            {/* Adopted overlay */}
            {pet.adoption_status === 'adopted' && (
              <div className="absolute inset-0 z-30 bg-emerald-950/85 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center">
                <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/30 mb-4 shadow-xl shadow-emerald-500/20 animate-pulse">
                  <PartyPopper className="w-10 h-10 text-emerald-400 animate-bounce" />
                </div>
                <span className="text-3xl font-black text-emerald-300 uppercase tracking-widest text-shadow-xl">
                  ¡Mascota Adoptada!
                </span>
                <p className="text-sm text-emerald-100/80 mt-2 max-w-xs leading-relaxed">
                  {pet.name} ha encontrado una familia y un nuevo hogar lleno de amor y cuidados 🏡❤️
                </p>
              </div>
            )}

            {/* Photo navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActivePhoto(i => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/50 backdrop-blur-md rounded-full border border-white/15 hover:bg-black/70 transition-all z-40"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActivePhoto(i => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/50 backdrop-blur-md rounded-full border border-white/15 hover:bg-black/70 transition-all z-40"
                  aria-label="Foto siguiente"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                {/* Dot indicators */}
                <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-1.5 z-40">
                  {images.map((_: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => setActivePhoto(i)}
                      aria-label={`Foto ${i + 1}`}
                      className={`rounded-full transition-all ${i === activePhoto ? 'w-6 h-2 bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'w-2 h-2 bg-white/40 hover:bg-white/60'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-900/30 to-zinc-900">
            <PawPrint className="w-20 h-20 text-white/10" />
          </div>
        )}

        {/* Back button */}
        <div className="absolute top-4 left-4 z-40">
          <Link
            href="/adopt"
            className="p-2.5 bg-black/60 backdrop-blur-md rounded-full border border-white/15 hover:bg-black/80 transition-all flex items-center"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Favorite + photo count */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-40">
          {images.length > 1 && (
            <span className="px-2 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-xs text-white/70">
              {activePhoto + 1}/{images.length}
            </span>
          )}
          <button
            onClick={handleFavorite}
            aria-label={favorited ? 'Quitar de favoritos' : 'Guardar'}
            className="p-2.5 bg-black/60 backdrop-blur-md rounded-full border border-white/15 hover:bg-black/80 transition-all"
          >
            <Bookmark className={`w-4 h-4 transition-colors ${favorited ? 'fill-amber-400 text-amber-400' : 'text-white'}`} />
          </button>
        </div>

        {/* Urgent badge on image */}
        {pet.urgent && pet.adoption_status !== 'adopted' && (
          <div className="absolute bottom-10 left-4 z-40">
            <span className="px-3 py-1 bg-red-500 text-white text-xs font-black uppercase tracking-wider rounded-full shadow-lg">
              🚨 URGENTE
            </span>
          </div>
        )}
      </div>

      {/* ── CONTENT CARD: slides up over image ── */}
      <div className="relative -mt-6 rounded-t-3xl bg-background border-t border-white/10 pb-48 z-20 shadow-2xl">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/15" />
        </div>

        <div className="px-4 sm:px-6 max-w-2xl mx-auto space-y-6 pt-3">

          {/* Name + meta row */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-bold leading-tight">
                {SPECIES_EMOJI[pet.species] || '🐾'} {pet.name}
              </h1>
            </div>
            <p className="text-white/50 text-sm mt-1 flex items-center gap-2 flex-wrap">
              {ageStr && <span>{ageStr}</span>}
              {ageStr && SIZE_LABELS[pet.size] && <span className="text-white/20">·</span>}
              {SIZE_LABELS[pet.size] && <span>{SIZE_LABELS[pet.size]}</span>}
              <span className="text-white/20">·</span>
              <span>{pet.gender === 'male' ? '♂ Macho' : '♀ Hembra'}</span>
            </p>
            {pet.city && (
              <p className="flex items-center gap-1.5 text-white/40 text-sm mt-1.5">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                {pet.city}{pet.country ? `, ${pet.country}` : ''}
              </p>
            )}
            {pet.shelter && (
              <div className="mt-3">
                <ShelterBadge shelter={pet.shelter} size="sm" />
              </div>
            )}
          </div>

          {/* Description */}
          {pet.description && (
            <section>
              <h2 className="text-xs text-white/35 uppercase tracking-widest font-semibold mb-2">Su historia</h2>
              <p className="text-white/75 leading-relaxed text-[15px]">{pet.description}</p>
            </section>
          )}

          {/* Characteristics chips */}
          <section>
            <h2 className="text-xs text-white/35 uppercase tracking-widest font-semibold mb-3">Características</h2>
            <div className="flex flex-wrap gap-2">
              <Badge active={pet.vaccinated} label="Vacunado" icon="✅" />
              <Badge active={pet.neutered} label="Castrado" icon="✂️" />
              <Badge active={pet.good_with_kids} label="Con niños" icon="👶" />
              <Badge active={pet.good_with_dogs} label="Con perros" icon="🐕" />
              <Badge active={pet.good_with_cats} label="Con gatos" icon="🐈" />
              <Badge active={pet.apartment_friendly} label="Apto depto" icon="🏢" />
            </div>
          </section>

          {/* Energy level */}
          {pet.energy_level && (
            <section>
              <h2 className="text-xs text-white/35 uppercase tracking-widest font-semibold mb-3">Nivel de energía</h2>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <div
                      key={n}
                      className={`h-2 rounded-full transition-all ${n <= pet.energy_level ? ENERGY_COLORS[pet.energy_level] : 'bg-white/10'} ${n <= pet.energy_level ? 'w-8' : 'w-5'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-white/60 font-medium">
                  {ENERGY_LABELS[pet.energy_level]}
                </span>
              </div>
            </section>
          )}

          {/* Special needs */}
          {pet.special_needs && (
            <section className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
              <h2 className="text-xs text-purple-300 uppercase tracking-widest font-semibold mb-1.5">Necesidades especiales</h2>
              <p className="text-white/70 text-sm leading-relaxed">{pet.special_needs}</p>
            </section>
          )}

          {/* Thumbnail strip (if multiple photos) */}
          {images.length > 1 && (
            <section>
              <h2 className="text-xs text-white/35 uppercase tracking-widest font-semibold mb-3">Más fotos</h2>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                {images.map((img: any, i: number) => (
                  <button
                    key={img.image_url}
                    onClick={() => {
                      setActivePhoto(i)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                      i === activePhoto ? 'border-amber-500 opacity-100' : 'border-transparent opacity-55 hover:opacity-80'
                    }`}
                  >
                    <Image
                      src={img.image_url}
                      alt={`${pet.name} foto ${i + 1}`}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Owner / Shelter info */}
          {pet.owner && (
            <section>
              <h2 className="text-xs text-white/35 uppercase tracking-widest font-semibold mb-3">Publicado por</h2>
              <div className="flex items-center gap-3 p-4 glass rounded-2xl border border-white/8">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 flex-shrink-0 relative">
                  {pet.owner.avatar_url ? (
                    <Image src={pet.owner.avatar_url} alt={pet.owner.username} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30 text-xl font-bold">
                      {pet.owner.username?.[0]?.toUpperCase() ?? '?'}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{pet.owner.full_name || pet.owner.username}</p>
                  <p className="text-white/40 text-sm">@{pet.owner.username}</p>
                </div>
                {pet.shelter?.verified && (
                  <BadgeCheck className="w-5 h-5 fill-emerald-500 text-emerald-900 flex-shrink-0" />
                )}
              </div>

              {pet.shelter && (pet.shelter.website || pet.shelter.instagram) && (
                <div className="flex gap-2 mt-3">
                  {pet.shelter.website && (
                    <a
                      href={pet.shelter.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full text-xs text-white/60 hover:text-white border border-white/10 hover:border-white/20 transition-all"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Sitio web
                    </a>
                  )}
                  {pet.shelter.instagram && (
                    <a
                      href={`https://instagram.com/${pet.shelter.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full text-xs text-white/60 hover:text-white border border-white/10 hover:border-white/20 transition-all"
                    >
                      <span>📸</span>
                      Instagram
                    </a>
                  )}
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {/* ── STICKY CTA ── */}
      <div 
        className="fixed left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-t border-white/10 px-4 py-3 shadow-2xl"
        style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="max-w-md mx-auto">
          {pet.adoption_status === 'available' ? (
            <button
              onClick={() => setShowRequest(true)}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 to-orange-500 text-amber-950 font-black text-base rounded-2xl shadow-xl shadow-amber-500/25 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 uppercase tracking-wide"
            >
              <Heart className="w-5 h-5 fill-amber-950 text-amber-950" />
              Quiero adoptar a {pet.name}
            </button>
          ) : (
            <div className="w-full py-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-base rounded-2xl text-center uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10">
              <span>🏡</span> ¡Ya encontró un hogar lleno de amor!
            </div>
          )}
        </div>
      </div>

      {/* Request modal */}
      {showRequest && (
        <AdoptionRequestModal
          petId={pet.id}
          petName={pet.name}
          ownerId={pet.owner_id}
          onClose={() => setShowRequest(false)}
        />
      )}
    </div>
  )
}
