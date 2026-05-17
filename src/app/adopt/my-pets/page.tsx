import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { getMyAdoptionPets } from '../actions'
import { PublishAdoptionButton } from '@/components/adoption/PublishAdoptionButton'
import { AdoptionRequestsPanel } from '@/components/adoption/AdoptionRequestsPanel'
import { ArrowLeft, PawPrint } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default async function MyAdoptionPetsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { pets } = await getMyAdoptionPets()

  const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
    available: { label: 'Disponible', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    pending: { label: 'En proceso', cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    adopted: { label: 'Adoptado', cls: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-500/10 blur-[140px] pointer-events-none" />

      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-white/5 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/adopt" className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">Mis publicaciones</h1>
            <p className="text-white/40 text-xs">{pets.length} mascota{pets.length !== 1 ? 's' : ''} publicada{pets.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-8">
        {/* Publish button */}
        <PublishAdoptionButton />

        {/* My pets */}
        {pets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <PawPrint className="w-16 h-16 text-white/10 mb-4" />
            <h2 className="text-xl font-bold text-white/40 mb-2">Sin publicaciones</h2>
            <p className="text-white/30 text-sm">Publica una mascota para que encuentre su hogar ideal.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pets.map((pet: any) => {
              const mainImg = pet.images?.sort((a: any, b: any) => a.position - b.position)[0]?.image_url
              const pendingCount = pet.requests?.filter((r: any) => r.status === 'pending').length ?? 0
              const status = STATUS_LABELS[pet.adoption_status] ?? STATUS_LABELS.available

              return (
                <div key={pet.id} className="glass rounded-3xl overflow-hidden border border-white/8">
                  {/* Pet header */}
                  <Link href={`/adopt/${pet.id}`} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-all">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/10 relative flex-shrink-0">
                      {mainImg ? (
                        <Image src={mainImg} alt={pet.name} fill className="object-cover" />
                      ) : (
                        <PawPrint className="w-8 h-8 text-white/20 m-auto mt-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg">{pet.name}</h3>
                      <p className="text-white/50 text-sm">{pet.breed || pet.species} · {pet.city || 'Sin ciudad'}</p>
                      <span className={`mt-1 inline-block text-xs font-semibold px-2 py-0.5 rounded-full border ${status.cls}`}>
                        {status.label}
                      </span>
                    </div>
                    {pendingCount > 0 && (
                      <span className="flex-shrink-0 bg-amber-500 text-amber-950 text-xs font-black px-2 py-1 rounded-full">
                        {pendingCount} solicitud{pendingCount > 1 ? 'es' : ''}
                      </span>
                    )}
                  </Link>

                  {/* Requests panel */}
                  {pet.requests && pet.requests.length > 0 && (
                    <div className="border-t border-white/8">
                      <AdoptionRequestsPanel requests={pet.requests} petName={pet.name} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>

      <Navigation />
    </div>
  )
}
