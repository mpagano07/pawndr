import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { FeedClient } from './FeedClient'
import { PawPrint } from 'lucide-react'
import { getDictionary } from '@/i18n/getDictionary'
import { FilterBar } from '@/components/ui/FilterBar'
import { MatchesHeaderButton } from '@/components/feed/MatchesHeaderButton'
import { Suspense } from 'react'

interface FeedPageProps {
  searchParams: {
    species?: string
    gender?: string
    maxAge?: string
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const dict = getDictionary()

  if (!user) {
    redirect('/auth/login')
  }

  // 1. Fetch user's primary pet with full details for matching
  const { data: userPets } = await supabase
    .from('pets')
    .select('*')
    .eq('owner_id', user.id)
    .limit(1)

  const myPet = userPets && userPets.length > 0 ? userPets[0] : null
  const myPetId = myPet?.id

  let unswipedPets: any[] = []
  let rejectedPets: any[] = []

  if (myPet) {
    const { data: existingSwipes } = await supabase
      .from('swipes')
      .select('swiped_pet_id, action')
      .eq('swiper_pet_id', myPetId)

    const likedIds = existingSwipes?.filter(s => s.action === 'like').map(s => s.swiped_pet_id) || []
    const dislikedIds = existingSwipes?.filter(s => s.action === 'dislike').map(s => s.swiped_pet_id) || []
    const allSwipedIds = [...likedIds, ...dislikedIds]

    const species = Array.isArray(searchParams.species) ? searchParams.species[0] : searchParams.species
    const gender = Array.isArray(searchParams.gender) ? searchParams.gender[0] : searchParams.gender
    const maxAge = Array.isArray(searchParams.maxAge) ? searchParams.maxAge[0] : searchParams.maxAge

    // 2. Build query with filters — exclude ALL swiped pets for fresh queue
    let query = supabase
      .from('pets')
      .select(`*, owner:owner_id (location)`)
      .neq('owner_id', user.id)

    if (allSwipedIds.length > 0) {
      query = query.not('id', 'in', `(${allSwipedIds.map(id => `"${id}"`).join(',')})`)
    }
    if (species && species !== '') query = query.eq('species', species)
    if (gender && gender !== '') query = query.eq('gender', gender)
    if (maxAge && !isNaN(parseInt(maxAge))) query = query.lte('age', parseInt(maxAge))

    const { data: potentialMatches, error: queryError } = await query.limit(50)
    if (queryError) console.error('[Feed Query Error]:', queryError)
    unswipedPets = potentialMatches || []

    // 3. Fetch disliked pets separately so client can recycle them even after refresh
    if (dislikedIds.length > 0) {
      let rejectedQuery = supabase
        .from('pets')
        .select(`*, owner:owner_id (location)`)
        .in('id', dislikedIds)
        .neq('owner_id', user.id)

      if (species && species !== '') rejectedQuery = rejectedQuery.eq('species', species)
      if (gender && gender !== '') rejectedQuery = rejectedQuery.eq('gender', gender)
      if (maxAge && !isNaN(parseInt(maxAge))) rejectedQuery = rejectedQuery.lte('age', parseInt(maxAge))

      const { data: rejected } = await rejectedQuery.limit(100)
      rejectedPets = rejected || []
    }
  }



  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-500/20 blur-[120px] pointer-events-none" />

      <header className="pt-12 pb-4 px-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <PawPrint className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-gradient">{dict.feed.discover}</h1>
        </div>
        <div className="flex items-center gap-2">
          <MatchesHeaderButton />
          <Suspense fallback={null}>
            <FilterBar />
          </Suspense>
        </div>
      </header>

      <main className="relative z-10 px-4 mt-4 flex justify-center">
        <FeedClient
          key={JSON.stringify(searchParams)}
          initialPets={unswipedPets}
          rejectedPets={rejectedPets}
          swiperPet={myPet}
        />
      </main>

      <Navigation />
    </div>
  )
}
