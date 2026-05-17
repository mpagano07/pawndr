import { BadgeCheck, Home, Heart } from 'lucide-react'
import type { Shelter } from '@/types'

interface ShelterBadgeProps {
  shelter?: Shelter | null
  size?: 'sm' | 'md'
}

const TYPE_LABEL: Record<string, { label: string; icon: string }> = {
  shelter: { label: 'Refugio', icon: '🏠' },
  rescue: { label: 'Rescatista', icon: '🦺' },
  foster: { label: 'Hogar de tránsito', icon: '❤️' },
}

export function ShelterBadge({ shelter, size = 'sm' }: ShelterBadgeProps) {
  if (!shelter) return null

  const typeInfo = TYPE_LABEL[shelter.shelter_type] ?? { label: 'Organización', icon: '🐾' }
  const isSmall = size === 'sm'

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border
        ${shelter.verified
          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
          : 'bg-white/10 border-white/15 text-white/60'
        }
        ${isSmall ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'}
      `}
    >
      <span>{typeInfo.icon}</span>
      <span className="font-semibold truncate max-w-[120px]">{shelter.organization_name}</span>
      {shelter.verified && (
        <BadgeCheck className={`flex-shrink-0 fill-emerald-500 text-emerald-900 ${isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
      )}
    </div>
  )
}
