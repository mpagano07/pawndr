'use client'

import { User, Heart, MessageCircle, Globe, Store, HeartHandshake } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/i18n/LanguageProvider'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export function Navigation() {
  const pathname = usePathname()
  const dict = useTranslation()
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    const fetchUnread = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: userPets } = await supabase.from('pets').select('id').eq('owner_id', user.id)
      const myPetIds = userPets?.map(p => p.id) || []

      if (myPetIds.length === 0) {
        setUnreadCount(0)
        return
      }

      const { data: matchesAsPet1 } = await supabase
        .from('matches')
        .select('id')
        .in('pet1_id', myPetIds)

      const { data: matchesAsPet2 } = await supabase
        .from('matches')
        .select('id')
        .in('pet2_id', myPetIds)

      const allMatches = [...(matchesAsPet1 || []), ...(matchesAsPet2 || [])]
      const uniqueMatchIds = [...new Set(allMatches.map(m => m.id))]

      if (uniqueMatchIds.length === 0) {
        setUnreadCount(0)
        return
      }

      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .in('match_id', uniqueMatchIds)
        .neq('sender_id', user.id)
        .eq('is_read', false)

      setUnreadCount(count || 0)
    }

    fetchUnread()

    const channel = supabase
      .channel('global-unread-count')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => fetchUnread())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, () => fetchUnread())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // Tabs activos en la barra de navegación
  // "Comunidad" está desactivado temporalmente (se activa cuando el módulo esté listo)
  // "Matches" fue movido al header del feed para liberar espacio
  const activeTabs = [
    { name: dict.nav.feed, href: '/feed', icon: Heart },
    { name: 'Adoptar', href: '/adopt', icon: HeartHandshake },
    { name: dict.nav.profile, href: '/profiles', icon: User },
    { name: dict.nav.services, href: '/services', icon: Store },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/10 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-1">

        {activeTabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/')
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full space-y-0.5 transition-all relative',
                isActive ? 'text-primary' : 'text-white/40 hover:text-white/60'
              )}
            >
              <div className="relative">
                <tab.icon
                  className={cn(
                    'w-5 h-5',
                    isActive && tab.href === '/adopt' && 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]',
                    isActive && tab.href !== '/adopt' && 'fill-current drop-shadow-[0_0_8px_rgba(230,57,70,0.5)]'
                  )}
                />
              </div>
              <span className={cn(
                'font-medium transition-all',
                isActive ? 'text-[9px]' : 'text-[8px]'
              )}>
                {tab.name}
              </span>
            </Link>
          )
        })}

        {/* Comunidad — desactivado temporalmente, se activa cuando el módulo esté listo */}
        {/* Para reactivar: mover este bloque al array activeTabs de arriba */}
        <div className="flex flex-col items-center justify-center flex-1 h-full space-y-0.5 relative opacity-35 cursor-not-allowed select-none">
          <div className="relative">
            <Globe className="w-5 h-5 text-white/40" />
            <span className="absolute -top-2 -right-3 text-[7px] font-bold bg-white/15 text-white/60 px-1 py-0.5 rounded-full leading-none whitespace-nowrap">
              pronto
            </span>
          </div>
          <span className="text-[8px] font-medium text-white/40">Comunidad</span>
        </div>

      </div>
    </nav>
  )
}
