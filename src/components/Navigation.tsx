'use client'

import { User, Heart, Store, HeartHandshake, SearchX, LogOut, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/i18n/LanguageProvider'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

function BurgerPlusIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Burger lines */}
      <line x1="4" x2="14" y1="6" y2="6" />
      <line x1="4" x2="14" y1="12" y2="12" />
      <line x1="4" x2="14" y1="18" y2="18" />
      {/* Plus sign */}
      <line x1="19" x2="19" y1="8" y2="16" className="text-primary stroke-[#FF1A5E]" strokeWidth="2.5" />
      <line x1="15" x2="23" y1="12" y2="12" className="text-primary stroke-[#FF1A5E]" strokeWidth="2.5" />
    </svg>
  )
}

export function Navigation() {
  const pathname = usePathname()
  const dict = useTranslation()
  const [unreadCount, setUnreadCount] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
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
      const uniqueMatchIds = Array.from(new Set(allMatches.map(m => m.id)))


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

  // Close menu when navigating
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
  }

  // Core tabs visible directly in the bar
  const mainTabs = [
    { name: dict.nav.feed, href: '/feed', icon: Heart },
    { name: 'Adoptar', href: '/adopt', icon: HeartHandshake },
    { name: 'Perdidos', href: '/lost-found', icon: SearchX },
    { name: dict.nav.services, href: '/services', icon: Store },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/10 pb-safe">
      <div className="relative flex justify-around items-center h-16 max-w-md mx-auto px-1">

        {mainTabs.map((tab) => {
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

        {/* Trigger for more options */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={cn(
            'flex flex-col items-center justify-center flex-1 h-full space-y-0.5 transition-all relative outline-none',
            isMenuOpen ? 'text-primary' : 'text-white/40 hover:text-white/60'
          )}
        >
          <div className="relative">
            <BurgerPlusIcon
              className={cn(
                'w-5 h-5 transition-transform duration-300',
                isMenuOpen && 'rotate-90'
              )}
            />
          </div>
          <span className={cn(
            'font-medium transition-all',
            isMenuOpen ? 'text-[9px]' : 'text-[8px]'
          )}>
            Más
          </span>
        </button>

        {/* Backdrop for click away */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 z-30 bg-transparent"
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        {/* Pop-up dropdown menu */}
        <div
          className={cn(
            "absolute bottom-20 right-4 w-48 bg-[#0d0914]/95 backdrop-blur-md border border-white/10 rounded-2xl p-1.5 shadow-[0_-10px_25px_rgba(0,0,0,0.5)] z-40 transition-all duration-300 transform origin-bottom-right",
            isMenuOpen
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-2 pointer-events-none"
          )}
        >
          <div className="flex flex-col space-y-0.5">
            <Link
              href="/profiles"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all",
                pathname === "/profiles"
                  ? "bg-white/10 text-primary"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              <User className="w-4 h-4 text-white/50" />
              <span>{dict.nav.profile}</span>
            </Link>

            <Link
              href="/community"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all",
                pathname === "/community"
                  ? "bg-white/10 text-primary"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              <Users className="w-4 h-4 text-white/50" />
              <span>Comunidad</span>
            </Link>


            <div className="h-px bg-white/10 my-1" />

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all w-full text-left"
            >
              <LogOut className="w-4 h-4 text-red-400/70" />
              <span>{(dict as any).logout || 'Cerrar sesión'}</span>
            </button>
          </div>
        </div>

      </div>
    </nav>
  )
}

