import type { LostFoundPet } from '@/types'
import Link from 'next/link'
import { Heart, MapPin, Calendar, User, MessageCircle } from 'lucide-react'
import Image from 'next/image'

interface LostFoundCardProps {
  pet: LostFoundPet
}

export function LostFoundCard({ pet }: LostFoundCardProps) {
  const mainImage = pet.images?.[0]?.image_url

  const typeColor = pet.type === 'lost' ? 'text-red-500' : 'text-green-500'
  const typeBg = pet.type === 'lost' ? 'bg-red-500/10' : 'bg-green-500/10'
  const typeLabel = pet.type === 'lost' ? 'Perdido' : 'Encontrado'

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-AR', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Link
      href={`/lost-found/${pet.id}`}
      className="block group rounded-xl overflow-hidden bg-white/5 hover:bg-white/10 transition-all border border-white/10 hover:border-white/20"
    >
      <div className="aspect-square relative overflow-hidden bg-black/40">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={pet.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5">
            <span className="text-white/40 text-sm">Sin foto</span>
          </div>
        )}

        {/* Badge */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-semibold ${typeBg} ${typeColor}`}>
          {typeLabel}
        </div>

        {/* Status badge */}
        <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-black/60 text-white/80 text-xs">
          {pet.status === 'active' ? 'Activo' : pet.status === 'found' ? 'Encontrado' : 'Resuelto'}
        </div>
      </div>

      <div className="p-4 space-y-2">
        {/* Nombre y especie */}
        <div>
          <h3 className="font-semibold text-white text-lg">{pet.name}</h3>
          <p className="text-white/60 text-sm capitalize">{pet.species} {pet.breed && `· ${pet.breed}`}</p>
        </div>

        {/* Descripción */}
        <p className="text-white/70 text-sm line-clamp-2">{pet.description}</p>

        {/* Información */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center space-x-2 text-white/60 text-sm">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{pet.last_seen_location}</span>
          </div>

          <div className="flex items-center space-x-2 text-white/60 text-sm">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>{formatDate(pet.date_lost_or_found)}</span>
          </div>

          {pet.reporter && (
            <div className="flex items-center space-x-2 text-white/60 text-sm">
              <User className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">@{pet.reporter.username}</span>
            </div>
          )}

          {pet.reward_amount && (
            <div className="flex items-center space-x-2 text-green-500 text-sm font-semibold">
              <Heart className="w-4 h-4 flex-shrink-0" />
              <span>Recompensa: ${pet.reward_amount}</span>
            </div>
          )}
        </div>

        {/* Respuestas */}
        {pet.response_count !== undefined && (
          <div className="flex items-center space-x-2 text-white/50 text-xs pt-2 border-t border-white/10">
            <MessageCircle className="w-4 h-4" />
            <span>{pet.response_count} respuesta{pet.response_count !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </Link>
  )
}
