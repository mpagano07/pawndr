import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { LostFoundClient } from '@/components/lost-found/LostFoundClient'
import { getLostFoundFeed } from './actions'
import { SearchX, Plus, LayoutList } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import { LostFoundSkeleton } from '@/components/lost-found/LostFoundSkeleton'
import type { LostFoundFilters } from '@/types'

export const dynamic = 'force-dynamic'

interface LostFoundPageProps {
  searchParams: {
    type?: string
    species?: string
    city?: string
    status?: string
  }
}

export default async function LostFoundPage({ searchParams }: LostFoundPageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const filters: LostFoundFilters = {
    type: (searchParams.type as any) || undefined,
    species: searchParams.species || undefined,
    city: searchParams.city || undefined,
    status: (searchParams.status as any) || 'active',
  }

  const { pets, error } = await getLostFoundFeed(filters, 0, 12)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-black pb-24">
      <Navigation />

      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur-sm bg-black/50 border-b border-white/10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SearchX className="w-5 h-5 text-red-500" />
            <h1 className="text-lg font-bold">Perdidos & Encontrados</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              href="/lost-found/my-reports"
              className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-500 transition-colors"
              title="Mis reportes"
            >
              <LayoutList className="w-5 h-5" />
            </Link>
            <Link
              href="/lost-found/report"
              className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-500 transition-colors"
              title="Reportar mascota"
            >
              <Plus className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-md mx-auto px-4 py-4 border-b border-white/5">
        <div className="grid grid-cols-3 gap-2">
          <Link
            href="?type=lost&status=active"
            className={`px-3 py-2 rounded-lg text-sm font-medium text-center transition-all ${
              searchParams.type === 'lost'
                ? 'bg-red-500 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            Perdidos
          </Link>
          <Link
            href="?type=found&status=active"
            className={`px-3 py-2 rounded-lg text-sm font-medium text-center transition-all ${
              searchParams.type === 'found'
                ? 'bg-green-500 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            Encontrados
          </Link>
          <Link
            href="/lost-found?status=active"
            className={`px-3 py-2 rounded-lg text-sm font-medium text-center transition-all ${
              !searchParams.type
                ? 'bg-primary text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            Todos
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto">
        {error ? (
          <div className="m-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
            Error al cargar los reportes: {error}
          </div>
        ) : (
          <Suspense fallback={<LostFoundSkeleton />}>
            <LostFoundClient initialPets={pets} />
          </Suspense>
        )}
      </div>
    </div>
  )
}
