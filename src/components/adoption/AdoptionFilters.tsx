'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState } from 'react'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'

interface FilterState {
  species: string
  size: string
  gender: string
  vaccinated: boolean
  neutered: boolean
  goodWithDogs: boolean
  goodWithCats: boolean
  goodWithKids: boolean
  apartmentFriendly: boolean
  urgent: boolean
}

const DEFAULT_FILTERS: FilterState = {
  species: '',
  size: '',
  gender: '',
  vaccinated: false,
  neutered: false,
  goodWithDogs: false,
  goodWithCats: false,
  goodWithKids: false,
  apartmentFriendly: false,
  urgent: false,
}

export function AdoptionFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)

  const getInitialFilters = (): FilterState => ({
    species: searchParams.get('species') || '',
    size: searchParams.get('size') || '',
    gender: searchParams.get('gender') || '',
    vaccinated: searchParams.get('vaccinated') === 'true',
    neutered: searchParams.get('neutered') === 'true',
    goodWithDogs: searchParams.get('goodWithDogs') === 'true',
    goodWithCats: searchParams.get('goodWithCats') === 'true',
    goodWithKids: searchParams.get('goodWithKids') === 'true',
    apartmentFriendly: searchParams.get('apartmentFriendly') === 'true',
    urgent: searchParams.get('urgent') === 'true',
  })

  const [filters, setFilters] = useState<FilterState>(getInitialFilters)

  const activeCount = Object.entries(filters).filter(([, v]) =>
    v !== '' && v !== false
  ).length

  const apply = () => {
    const params = new URLSearchParams()
    if (filters.species) params.set('species', filters.species)
    if (filters.size) params.set('size', filters.size)
    if (filters.gender) params.set('gender', filters.gender)
    if (filters.vaccinated) params.set('vaccinated', 'true')
    if (filters.neutered) params.set('neutered', 'true')
    if (filters.goodWithDogs) params.set('goodWithDogs', 'true')
    if (filters.goodWithCats) params.set('goodWithCats', 'true')
    if (filters.goodWithKids) params.set('goodWithKids', 'true')
    if (filters.apartmentFriendly) params.set('apartmentFriendly', 'true')
    if (filters.urgent) params.set('urgent', 'true')

    router.push(`${pathname}?${params.toString()}`)
    setOpen(false)
  }

  const reset = () => {
    setFilters(DEFAULT_FILTERS)
    router.push(pathname)
    setOpen(false)
  }

  const toggle = (key: keyof FilterState) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const SelectField = ({
    label,
    value,
    onChange,
    options,
  }: {
    label: string
    value: string
    onChange: (v: string) => void
    options: { value: string; label: string }[]
  }) => (
    <div>
      <label className="text-xs text-white/50 uppercase tracking-wider font-semibold block mb-1.5">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-amber-500/50 outline-none pr-8"
        >
          <option value="">Todos</option>
          {options.map(o => (
            <option key={o.value} value={o.value} className="bg-zinc-900">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
      </div>
    </div>
  )

  const ToggleChip = ({
    label,
    active,
    onClick,
  }: {
    label: string
    active: boolean
    onClick: () => void
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
        active
          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
          : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
      }`}
    >
      {label}
    </button>
  )

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition-all ${
          activeCount > 0
            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filtros
        {activeCount > 0 && (
          <span className="bg-amber-500 text-amber-950 text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      {/* Drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="relative z-10 w-full max-w-md bg-zinc-900 border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Filtros de Adopción</h2>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <SelectField
                label="Especie"
                value={filters.species}
                onChange={v => setFilters(p => ({ ...p, species: v }))}
                options={[
                  { value: 'dog', label: '🐕 Perro' },
                  { value: 'cat', label: '🐈 Gato' },
                  { value: 'rabbit', label: '🐇 Conejo' },
                  { value: 'bird', label: '🦜 Ave' },
                  { value: 'other', label: '🐾 Otro' },
                ]}
              />

              <SelectField
                label="Tamaño"
                value={filters.size}
                onChange={v => setFilters(p => ({ ...p, size: v }))}
                options={[
                  { value: 'small', label: 'Pequeño' },
                  { value: 'medium', label: 'Mediano' },
                  { value: 'large', label: 'Grande' },
                  { value: 'xlarge', label: 'Extra grande' },
                ]}
              />

              <SelectField
                label="Género"
                value={filters.gender}
                onChange={v => setFilters(p => ({ ...p, gender: v }))}
                options={[
                  { value: 'male', label: '♂ Macho' },
                  { value: 'female', label: '♀ Hembra' },
                ]}
              />

              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider font-semibold block mb-3">
                  Características
                </label>
                <div className="flex flex-wrap gap-2">
                  <ToggleChip label="✅ Vacunado" active={filters.vaccinated} onClick={() => toggle('vaccinated')} />
                  <ToggleChip label="✂️ Castrado" active={filters.neutered} onClick={() => toggle('neutered')} />
                  <ToggleChip label="🐕 Con perros" active={filters.goodWithDogs} onClick={() => toggle('goodWithDogs')} />
                  <ToggleChip label="🐈 Con gatos" active={filters.goodWithCats} onClick={() => toggle('goodWithCats')} />
                  <ToggleChip label="👶 Con niños" active={filters.goodWithKids} onClick={() => toggle('goodWithKids')} />
                  <ToggleChip label="🏢 Apto depto" active={filters.apartmentFriendly} onClick={() => toggle('apartmentFriendly')} />
                  <ToggleChip label="🚨 Urgente" active={filters.urgent} onClick={() => toggle('urgent')} />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={reset}
                className="flex-1 py-3 rounded-xl border border-white/15 text-white/60 font-semibold hover:bg-white/5 transition-all text-sm"
              >
                Limpiar
              </button>
              <button
                onClick={apply}
                className="flex-1 py-3 rounded-xl bg-amber-500 text-amber-950 font-bold hover:bg-amber-400 transition-all text-sm"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
