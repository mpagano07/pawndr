import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getMyLostFoundReports } from '../actions'
import { MyLostFoundClient } from '@/components/lost-found/MyLostFoundClient'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function MyLostFoundPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { pets, error } = await getMyLostFoundReports()

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
          <h1 className="text-lg font-bold">Mis reportes</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {error ? (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
            Error al cargar tus reportes: {error}
          </div>
        ) : (
          <MyLostFoundClient initialPets={pets} />
        )}
      </div>
    </div>
  )
}
