import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { AdoptionFeedClient } from '@/components/adoption/AdoptionFeedClient'
import { AdoptionFilters } from '@/components/adoption/AdoptionFilters'
import { getAdoptionFeed, getUserFavoriteIds } from './actions'
import { HeartHandshake, PawPrint } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import { AdoptionSkeleton } from '@/components/adoption/AdoptionSkeleton'
import type { AdoptionFilters as AdoptionFiltersType } from '@/types'

export const dynamic = 'force-dynamic'

interface AdoptPageProps {
  searchParams: {
    species?: string
    size?: string
    gender?: string
    vaccinated?: string
    neutered?: string
    goodWithDogs?: string
    goodWithCats?: string
    goodWithKids?: string
    apartmentFriendly?: string
    urgent?: string
  }
}

export default async function AdoptPage({ searchParams }: AdoptPageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const filters: AdoptionFiltersType = {
    species: searchParams.species || undefined,
    size: (searchParams.size as any) || undefined,
    gender: searchParams.gender || undefined,
    vaccinated: searchParams.vaccinated === 'true' || undefined,
    neutered: searchParams.neutered === 'true' || undefined,
    goodWithDogs: searchParams.goodWithDogs === 'true' || undefined,
    goodWithCats: searchParams.goodWithCats === 'true' || undefined,
    goodWithKids: searchParams.goodWithKids === 'true' || undefined,
    apartmentFriendly: searchParams.apartmentFriendly === 'true' || undefined,
    urgent: searchParams.urgent === 'true' || undefined,
  }

  const [{ pets }, favoriteIds] = await Promise.all([
    getAdoptionFeed(filters, 0, 12),
    getUserFavoriteIds(),
  ])

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Warm ambient blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-500/10 blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[35%] h-[35%] rounded-full bg-orange-500/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-none">Adopciones</h1>
              <p className="text-xs text-white/40 mt-0.5">Encuentra tu compañero ideal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/adopt/saved"
              className="p-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-amber-400 hover:border-amber-500/30 transition-all"
              title="Guardados"
            >
              ⭐
            </Link>
            <Link
              href="/adopt/my-pets"
              className="p-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all"
              title="Mis publicaciones"
            >
              <PawPrint className="w-4 h-4" />
            </Link>
            <Suspense fallback={null}>
              <AdoptionFilters />
            </Suspense>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6">
        <Suspense fallback={<AdoptionSkeleton />}>
          <AdoptionFeedClient
            key={JSON.stringify(filters)}
            initialPets={pets as any}
            favoriteIds={favoriteIds}
            filters={filters}
          />
        </Suspense>
      </main>

      <Navigation />
    </div>
  )
}
