'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { AdoptionCard } from './AdoptionCard'
import { AdoptionSkeleton } from './AdoptionSkeleton'
import { getAdoptionFeed } from '@/app/adopt/actions'
import { PawPrint, RefreshCw } from 'lucide-react'
import type { AdoptionPet, AdoptionFilters } from '@/types'

interface AdoptionFeedClientProps {
  initialPets: AdoptionPet[]
  favoriteIds: string[]
  filters: AdoptionFilters
}

const PAGE_SIZE = 12

export function AdoptionFeedClient({ initialPets, favoriteIds, filters }: AdoptionFeedClientProps) {
  const [pets, setPets] = useState<AdoptionPet[]>(initialPets)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialPets.length === PAGE_SIZE)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    const { pets: more } = await getAdoptionFeed(filters, page, PAGE_SIZE)
    if (more.length < PAGE_SIZE) setHasMore(false)
    setPets(prev => [...prev, ...more as AdoptionPet[]])
    setPage(p => p + 1)
    setLoading(false)
  }, [loading, hasMore, page, filters])

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore() },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  if (pets.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <PawPrint className="w-16 h-16 text-white/10 mb-4" />
        <h3 className="text-xl font-bold text-white/40 mb-2">Sin resultados</h3>
        <p className="text-white/30 text-sm max-w-xs">
          No encontramos mascotas con esos filtros. Intenta con otros criterios.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {pets.map(pet => (
          <AdoptionCard
            key={pet.id}
            pet={pet as any}
            isFavorited={favoriteIds.includes(pet.id)}
          />
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="py-4">
        {loading && (
          <div className="flex justify-center py-6">
            <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />
          </div>
        )}
        {!hasMore && pets.length > 0 && (
          <p className="text-center text-white/20 text-sm py-6">
            Has visto todas las mascotas disponibles 🐾
          </p>
        )}
      </div>
    </div>
  )
}
