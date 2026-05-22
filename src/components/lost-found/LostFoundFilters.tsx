import Link from 'next/link'
import { X } from 'lucide-react'

interface LostFoundFiltersProps {
  searchParams: {
    type?: string
    species?: string
    city?: string
  }
}

export function LostFoundFilters({ searchParams }: LostFoundFiltersProps) {
  const species = [
    { value: 'dog', label: '🐕 Perro' },
    { value: 'cat', label: '🐈 Gato' },
    { value: 'rabbit', label: '🐇 Conejo' },
    { value: 'bird', label: '🦜 Ave' },
  ]

  const hasActiveFilters = searchParams.species || searchParams.city

  return (
    <div className="space-y-3">
      {/* Filtros activos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchParams.species && (
            <button
              onClick={() => {
                // Crear nueva URL sin el filtro de especie
              }}
              className="flex items-center space-x-1 bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-medium hover:bg-primary/30 transition-colors"
            >
              <span>Especie: {species.find(s => s.value === searchParams.species)?.label}</span>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Seleccionar especie */}
      <div>
        <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
          Filtrar por especie
        </label>
        <div className="grid grid-cols-4 gap-2">
          {species.map(s => (
            <Link
              key={s.value}
              href={`?species=${s.value}`}
              className={`px-2 py-2 rounded-lg text-xs text-center font-medium transition-all ${
                searchParams.species === s.value
                  ? 'bg-primary text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Limpiar filtros */}
      {hasActiveFilters && (
        <Link
          href="/lost-found"
          className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Limpiar filtros
        </Link>
      )}
    </div>
  )
}
