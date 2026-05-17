import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { AdoptionCard } from '@/components/adoption/AdoptionCard'
import { getFavorites } from '../actions'
import { ArrowLeft, Bookmark, PawPrint } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function SavedAdoptionsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { pets: favorites } = await getFavorites()

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-500/10 blur-[140px] pointer-events-none" />

      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-white/5 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link
            href="/adopt"
            className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold">Guardados</h1>
            {favorites.length > 0 && (
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full">
                {favorites.length}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6">
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Bookmark className="w-16 h-16 text-white/10 mb-4" />
            <h2 className="text-xl font-bold text-white/40 mb-2">Sin guardados aún</h2>
            <p className="text-white/30 text-sm max-w-xs mb-6">
              Guarda las mascotas que te interesan para volver a verlas fácilmente.
            </p>
            <Link
              href="/adopt"
              className="px-6 py-3 bg-amber-500 text-amber-950 font-bold rounded-xl hover:bg-amber-400 transition-all"
            >
              Explorar adopciones
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {favorites.map((fav: any) => (
              fav.pet && (
                <AdoptionCard
                  key={fav.adoption_pet_id}
                  pet={fav.pet}
                  isFavorited={true}
                />
              )
            ))}
          </div>
        )}
      </main>

      <Navigation />
    </div>
  )
}
