import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getAdoptionPetById, getUserFavoriteIds } from '../actions'
import { PetDetailClient } from '@/components/adoption/PetDetailClient'
import { Navigation } from '@/components/Navigation'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface AdoptDetailPageProps {
  params: { id: string }
  searchParams: { action?: string }
}

export async function generateMetadata({ params }: AdoptDetailPageProps): Promise<Metadata> {
  const { pet } = await getAdoptionPetById(params.id)
  if (!pet) return { title: 'Mascota no encontrada | Pawndr' }
  return {
    title: `Adoptar a ${pet.name} | Pawndr`,
    description: pet.description || `${pet.name} busca hogar. ¡Adoptá y cambiá una vida!`,
  }
}

export default async function AdoptDetailPage({ params, searchParams }: AdoptDetailPageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const [{ pet, error }, favoriteIds] = await Promise.all([
    getAdoptionPetById(params.id),
    getUserFavoriteIds(),
  ])

  if (error || !pet) notFound()

  return (
    <>
      <PetDetailClient
        pet={pet}
        isFavorited={favoriteIds.includes(pet.id)}
        openRequest={searchParams.action === 'request'}
      />
      <Navigation />
    </>
  )
}
