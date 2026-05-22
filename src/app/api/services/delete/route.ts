import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const serviceId = body?.serviceId
    if (!serviceId) return NextResponse.json({ error: 'serviceId is required' }, { status: 400 })

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const { data: service } = await supabase.from('services').select('provider_id').eq('id', serviceId).single()

    if (profile?.role !== 'admin' && service?.provider_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Try admin deletion first to bypass RLS
    try {
      const admin = createAdminClient()
      if (!admin) {
        console.warn('[API deleteService] admin client not available (SUPABASE_SERVICE_ROLE_KEY missing)')
      } else {
        const { data: deleted, error: delError } = await admin.from('services').delete().eq('id', serviceId).select('*')
        if (delError) {
          console.error('[API deleteService] admin delete error', delError)
        } else if (deleted && Array.isArray(deleted) && deleted.length > 0) {
          return NextResponse.json({ success: true, usedAdmin: true, deletedCount: deleted.length, deleted })
        } else {
          console.warn('[API deleteService] admin delete returned no rows', serviceId)
        }
      }
    } catch (adminErr: any) {
      console.warn('[API deleteService] admin client error (maybe SUPABASE_SERVICE_ROLE_KEY missing):', adminErr?.message)
    }

    // Fallback: try soft-delete (mark is_active = false) with admin if possible, else with session user
    try {
      const adminFallback = (process.env.SUPABASE_SERVICE_ROLE_KEY) ? createAdminClient() : null
      if (adminFallback) {
        const { data: updated, error: updErr } = await adminFallback.from('services').update({ is_active: false }).eq('id', serviceId).select('*')
        if (updErr) {
          console.error('[API deleteService] admin fallback update error', updErr)
        } else if (updated && Array.isArray(updated) && updated.length > 0) {
          return NextResponse.json({ success: true, usedAdmin: true, updatedCount: updated.length, updated })
        }
      }

      // Last resort: try with the session client (respecting RLS/ownership)
      const { data: updatedBySession, error: updSessionErr } = await supabase.from('services').update({ is_active: false }).eq('id', serviceId).select('*')
      if (updSessionErr) {
        console.error('[API deleteService] session update error', updSessionErr)
        return NextResponse.json({ success: false, error: updSessionErr.message || 'Update error' }, { status: 500 })
      }

      if (updatedBySession && Array.isArray(updatedBySession) && updatedBySession.length > 0) {
        return NextResponse.json({ success: true, usedAdmin: false, updatedCount: updatedBySession.length, updated: updatedBySession })
      }

      // Nothing deleted or updated
      console.warn('[API deleteService] no rows deleted or updated for', serviceId)
      return NextResponse.json({ success: true, deleted: [], updated: [] })
    } catch (fallbackErr: any) {
      console.error('[API deleteService] Fallback exception', fallbackErr)
      return NextResponse.json({ error: fallbackErr?.message || 'Fallback error' }, { status: 500 })
    }
  } catch (err: any) {
    console.error('[API deleteService] Exception', err)
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}
