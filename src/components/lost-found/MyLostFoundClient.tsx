'use client'

import { useState } from 'react'
import type { LostFoundPet } from '@/types'
import { deleteLostFoundReport } from '@/app/lost-found/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LostFoundCard } from './LostFoundCard'
import { Trash2, Edit2, Plus } from 'lucide-react'

interface MyLostFoundClientProps {
  initialPets: LostFoundPet[]
}

export function MyLostFoundClient({ initialPets }: MyLostFoundClientProps) {
  const router = useRouter()
  const [pets, setPets] = useState<LostFoundPet[]>(initialPets)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)

  const handleDelete = async (petId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este reporte?')) return

    setIsDeletingId(petId)
    try {
      const { error } = await deleteLostFoundReport(petId)

      if (error) {
        toast.error(error)
        return
      }

      setPets(prev => prev.filter(p => p.id !== petId))
      toast.success('Reporte eliminado')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error eliminando el reporte')
    } finally {
      setIsDeletingId(null)
    }
  }

  if (pets.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-2">Sin reportes</h2>
        <p className="text-white/60 mb-6">Aún no has creado ningún reporte de mascota perdida o encontrada</p>
        <Link
          href="/lost-found/report"
          className="inline-flex items-center space-x-2 bg-primary hover:bg-primary/80 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Crear reporte</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {pets.map((pet) => (
        <div key={pet.id} className="relative">
          <LostFoundCard pet={pet} />

          {/* Acciones */}
          <div className="absolute top-2 right-2 flex gap-2">
            <Link
              href={`/lost-found/${pet.id}`}
              className="p-2 rounded-lg bg-black/60 hover:bg-primary/60 text-white transition-colors"
              title="Ver detalles"
            >
              <Edit2 className="w-4 h-4" />
            </Link>

            <button
              onClick={() => handleDelete(pet.id)}
              disabled={isDeletingId === pet.id}
              className="p-2 rounded-lg bg-black/60 hover:bg-red-500/60 text-white transition-colors disabled:opacity-50"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
