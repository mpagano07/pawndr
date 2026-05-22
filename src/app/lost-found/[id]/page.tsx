import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getLostFoundPetById } from '../actions'
import { LostFoundDetailClient } from '@/components/lost-found/LostFoundDetailClient'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface LostFoundDetailPageProps {
  params: {
    id: string
  }
}

export default async function LostFoundDetailPage({ params }: LostFoundDetailPageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { pet, error } = await getLostFoundPetById(params.id)

  if (error || !pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-black pb-24 flex flex-col items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Mascota no encontrada</h1>
          <p className="text-white/60 mb-6">{error}</p>
          <Link
            href="/lost-found"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-black pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur-sm bg-black/80 border-b border-white/10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/lost-found"
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold">Detalles del reporte</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <LostFoundDetailClient pet={pet} currentUserId={user.id} />
    </div>
  )
}
