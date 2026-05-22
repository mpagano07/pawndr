'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { LostFoundPet } from '@/types'
import { LostFoundCard } from './LostFoundCard'
import { Loader2 } from 'lucide-react'

interface LostFoundClientProps {
  initialPets: LostFoundPet[]
}

export function LostFoundClient({ initialPets }: LostFoundClientProps) {
  const [pets, setPets] = useState<LostFoundPet[]>(initialPets)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observerTarget = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/lost-found?page=${page}&pageSize=12`)
      const data = await response.json()

      if (data.pets && data.pets.length > 0) {
        setPets([...pets, ...data.pets])
        setPage(page + 1)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more pets:', error)
    } finally {
      setIsLoading(false)
    }
  }, [page, isLoading, hasMore, pets])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current)
      }
    }
  }, [loadMore, hasMore, isLoading])

  return (
    <div className="space-y-4 px-4 py-6">
      {pets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-white/60">No hay reportes en este momento</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {pets.map((pet) => (
              <LostFoundCard key={pet.id} pet={pet} />
            ))}
          </div>

          {hasMore && (
            <div ref={observerTarget} className="flex justify-center py-8">
              {isLoading && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
            </div>
          )}
        </>
      )}
    </div>
  )
}
