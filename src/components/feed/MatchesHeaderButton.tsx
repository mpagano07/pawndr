'use client'

import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { cn } from '@/lib/utils'

export function MatchesHeaderButton() {
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    const fetchUnread = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: userPets } = await supabase
        .from('pets')
        .select('id')
        .eq('owner_id', user.id)
      const myPetIds = userPets?.map(p => p.id) || []
      if (myPetIds.length === 0) return

      const { data: matchesAsPet1 } = await supabase
        .from('matches')
        .select('id')
        .in('pet1_id', myPetIds)
      const { data: matchesAsPet2 } = await supabase
        .from('matches')
        .select('id')
        .in('pet2_id', myPetIds)

      const uniqueMatchIds = [
        ...new Set([...(matchesAsPet1 || []), ...(matchesAsPet2 || [])].map(m => m.id)),
      ]
      if (uniqueMatchIds.length === 0) return

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
      .channel('feed-header-unread')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, fetchUnread)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, fetchUnread)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  return (
    <Link
      href="/matches"
      className={cn(
        'relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all group',
        'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20',
        'text-white/60 hover:text-white'
      )}
    >
      <div className="relative">
        <MessageCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-primary text-[9px] text-white flex items-center justify-center rounded-full font-bold border border-zinc-950 px-0.5 shadow-[0_0_8px_rgba(230,57,70,0.6)] animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </div>
      <span className="text-xs font-semibold hidden sm:inline">Matches</span>
    </Link>
  )
}
