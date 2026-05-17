import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { addPet } from './actions'
import { logout } from '../auth/actions'
import { PawPrint, User, Plus, Edit2, LogOut, ShieldAlert, Image as ImageIcon } from 'lucide-react'
import { getDictionary } from '@/i18n/getDictionary'
import Link from 'next/link'
import Image from 'next/image'
import { LocationButton } from '@/components/ui/LocationButton'
import { ProfileForm } from '@/components/profiles/ProfileForm'
import { AddPetButton } from '@/components/profiles/AddPetButton'
import { DeletePetButton } from '@/components/profiles/DeletePetButton'
import { EditPetButton } from '@/components/profiles/EditPetButton'

const SPECIES_OPTIONS = [
  { value: 'dog', label: '🐕 Perro' },
  { value: 'cat', label: '🐈 Gato' },
  { value: 'rabbit', label: '🐇 Conejo' },
  { value: 'bird', label: '🦜 Ave' },
  { value: 'other', label: '🐾 Otro' },
]

export default async function ProfilesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: pets } = await supabase
    .from('pets')
    .select('*')
    .eq('owner_id', user.id)

  const isAdmin = profile?.role === 'admin'

  const dict = getDictionary()

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-8">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gradient tracking-tight">{dict.profile.title}</h1>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link href="/admin" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors" title="Admin Panel">
                <ShieldAlert className="w-5 h-5 text-red-400" />
              </Link>
            )}
            <form action={logout}>
              <button className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors" title="Log out">
                <LogOut className="w-5 h-5 text-white/60" />
              </button>
            </form>
          </div>
        </div>

        {/* User Profile Section */}
        <ProfileForm profile={profile} dict={dict} />

        {/* Pets Section */}
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <PawPrint className="text-primary w-6 h-6" /> {dict.profile.myPets}
        </h2>

        {pets && pets.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 mb-8">
            {pets.map((pet: any) => (
              <div key={pet.id} className="glass rounded-3xl p-4 flex flex-col items-center text-center relative overflow-hidden group">
                {pet.photos && pet.photos.length > 0 && (
                  <div
                    className="absolute inset-0 bg-cover bg-center z-0 opacity-40 group-hover:opacity-60 transition-opacity"
                    style={{ backgroundImage: `url(${pet.photos[0]})` }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-0" />

                <EditPetButton pet={pet} />
                <DeletePetButton petId={pet.id} petName={pet.name} />

                <div className="w-20 h-20 rounded-full bg-white/10 mb-3 flex items-center justify-center relative z-10 border border-white/20 overflow-hidden">
                  {pet.photos && pet.photos.length > 0 ? (
                    <Image 
                      src={pet.photos[0]} 
                      alt={pet.name} 
                      fill
                      sizes="80px"
                      className="object-cover" 
                    />
                  ) : (
                    <PawPrint className="w-8 h-8 text-white/40" />
                  )}
                </div>
                <h3 className="font-bold text-lg relative z-10">{pet.name}</h3>
                <p className="text-white/80 text-sm relative z-10">{pet.breed}</p>
                <p className="text-white/60 text-xs mt-1 relative z-10">
                  {pet.age} años • {pet.gender === 'male' ? dict.profile.petMale : dict.profile.petFemale}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass rounded-3xl p-8 mb-8 text-center border-dashed border-2 border-white/10">
            <PawPrint className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/60 mb-2">{dict.profile.noPets}</p>
          </div>
        )}

        {/* Add Pet Section */}
        <AddPetButton />
      </div>
      <Navigation />
    </div>
  )
}
