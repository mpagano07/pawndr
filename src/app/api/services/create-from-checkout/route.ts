import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const authClient = createClient()
    const { data: { user } } = await authClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await req.json()
    const {
      name,
      type,
      description,
      address,
      google_maps_url,
      phone,
      photos,
      preapprovalId
    } = body

    if (!name) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    }
    if (!type) {
      return NextResponse.json({ error: 'El tipo es requerido' }, { status: 400 })
    }
    if (!description) {
      return NextResponse.json({ error: 'La descripción es requerida' }, { status: 400 })
    }

    const supabase = createAdminClient()
    if (!supabase) {
      console.error('[Create Service API] SUPABASE_SERVICE_ROLE_KEY not configured')
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
    }

    // Insert the finalized service
    const { data: inserted, error: insertError } = await supabase
      .from('services')
      .insert({
        provider_id: user.id,
        name,
        type,
        description,
        address,
        google_maps_url,
        phone,
        photos: photos || [],
        rating_avg: 5.0,
        is_active: true, // We make it active immediately because they just paid
        mp_status: 'authorized', // Assumed from successful checkout return
        mp_preapproval_id: preapprovalId // Will be updated by webhook later to the real MP ID if needed
      })
      .select('id')
      .single()

    if (insertError || !inserted) {
      console.error('[Create Service API] Error creating final service:', insertError)
      return NextResponse.json({ error: 'Error creating service' }, { status: 500 })
    }

    return NextResponse.json({ success: true, serviceId: inserted.id })
  } catch (error: any) {
    console.error('[Create Service API Error]', error)
    return NextResponse.json({ error: error.message || 'Error creating service' }, { status: 500 })
  }
}
