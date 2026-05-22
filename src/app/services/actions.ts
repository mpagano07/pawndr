'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createService(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const name = formData.get('name') as string
  const type = formData.get('type') as string
  const description = formData.get('description') as string
  const address = formData.get('address') as string
  const googleMapsUrl = formData.get('google_maps_url') as string
  const phone = formData.get('phone') as string
  const photosArray = JSON.parse(formData.get('photos') as string || '[]') as string[]

  // Set user role to provider if not already
  await supabase
    .from('profiles')
    .update({ role: 'provider' })
    .eq('id', user.id)
    .is('role', null)

  const { data: serviceData, error } = await supabase
    .from('services')
    .insert({
      provider_id: user.id,
      name,
      type,
      description,
      address,
      google_maps_url: googleMapsUrl,
      phone,
      photos: photosArray,
      rating_avg: 5.0,
      is_active: true
    })
    .select('id')
    .single()

  if (error || !serviceData) {
    console.error('[createService Error]:', error)
    return { error: error?.message || 'Error al crear el servicio' }
  }

  console.log('[createService Success]: Service created for user', user.id)
  revalidatePath('/services')
  return { success: true, serviceId: serviceData.id }
}


export async function updateService(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const serviceId = formData.get('id') as string
  const name = formData.get('name') as string
  const type = formData.get('type') as string
  const description = formData.get('description') as string
  const address = formData.get('address') as string
  const googleMapsUrl = formData.get('google_maps_url') as string
  const phone = formData.get('phone') as string

  const photosArray = JSON.parse(formData.get('photos') as string || '[]') as string[]

  const { error } = await supabase
    .from('services')
    .update({
      name,
      type,
      description,
      address,
      google_maps_url: googleMapsUrl,
      phone,
      photos: photosArray,
      updated_at: new Date().toISOString()
    })
    .eq('id', serviceId)

  if (error) return { error: error.message }

  revalidatePath('/services')
  return { success: true }
}

export async function deleteService(serviceId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const { data: service } = await supabase.from('services').select('provider_id').eq('id', serviceId).single()

  if (profile?.role !== 'admin' && service?.provider_id !== user.id) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', serviceId)

  if (error) return { error: error.message }

  revalidatePath('/services')
  return { success: true }
}

export async function verifyService(serviceId: string, status: boolean) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Unauthorized. Admin only.' }

  const { error } = await supabase
    .from('services')
    .update({ is_verified: status })
    .eq('id', serviceId)

  if (error) return { error: error.message }

  revalidatePath('/services')
  return { success: true }
}

export async function addReview(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const serviceId = formData.get('service_id') as string
  const rating = parseInt(formData.get('rating') as string)
  const comment = formData.get('comment') as string

  const { error } = await supabase
    .from('service_reviews')
    .insert({
      service_id: serviceId,
      user_id: user.id,
      rating,
      comment
    })

  if (error) {
    if (error.code === '23505') return { error: 'Ya has calificado este servicio' }
    return { error: error.message }
  }

  revalidatePath('/services')
  return { success: true }
}
