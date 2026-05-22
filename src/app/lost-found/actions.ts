'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import type { LostFoundFilters } from '@/types'

// ─── Feed de mascotas perdidas/encontradas ────────────────────────────────────

export async function getLostFoundFeed(
  filters: LostFoundFilters = {},
  page = 0,
  pageSize = 12
) {
  const supabase = createClient()

  let query = supabase
    .from('lost_found_pets')
    .select(`
      *,
      images:lost_found_pet_images(id, image_url, position),
      reporter:reporter_id(
        id, username, full_name, avatar_url
      ),
      responses:lost_found_responses(id)
    `)
    .eq('status', filters.status || 'active')
    .order('date_lost_or_found', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1)

  if (filters.type) query = query.eq('type', filters.type)
  if (filters.species) query = query.eq('species', filters.species)
  if (filters.city) query = query.ilike('city', `%${filters.city}%`)

  const { data, error } = await query

  if (error) {
    console.error('[getLostFoundFeed Error]:', error)
    return { pets: [], error: error.message }
  }

  const formattedData = data?.map((pet: any) => ({
    ...pet,
    response_count: pet.responses?.length || 0
  })) ?? []

  return { pets: formattedData, error: null }
}

// ─── Detalle de mascota perdida/encontrada ─────────────────────────────────────

export async function getLostFoundPetById(id: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('lost_found_pets')
    .select(`
      *,
      images:lost_found_pet_images(id, image_url, position),
      reporter:reporter_id(
        id, username, full_name, avatar_url, bio
      ),
      responses:lost_found_responses(
        id, responder_id, message, location_details, photo_url, status, created_at,
        responder:responder_id(id, username, full_name, avatar_url)
      )
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    return { pet: null, error: error?.message || 'Mascota no encontrada' }
  }

  return { pet: data, error: null }
}

// ─── Crear reporte de mascota perdida/encontrada ────────────────────────────────

export async function createLostFoundReport(formData: {
  type: 'lost' | 'found'
  name: string
  description: string
  species: string
  breed?: string
  color?: string
  gender?: string
  age_description?: string
  distinguishing_features?: string
  last_seen_location: string
  date_lost_or_found: string
  city: string
  phone?: string
  whatsapp?: string
  email?: string
  contact_name?: string
  reward_amount?: number
  reward_description?: string
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado', petId: null }
  }

  const { data, error } = await supabase
    .from('lost_found_pets')
    .insert([
      {
        reporter_id: user.id,
        type: formData.type,
        name: formData.name,
        description: formData.description,
        species: formData.species,
        breed: formData.breed || null,
        color: formData.color || null,
        gender: formData.gender || null,
        age_description: formData.age_description || null,
        distinguishing_features: formData.distinguishing_features || null,
        last_seen_location: formData.last_seen_location,
        date_lost_or_found: formData.date_lost_or_found,
        city: formData.city,
        phone: formData.phone || null,
        whatsapp: formData.whatsapp || null,
        email: formData.email || null,
        contact_name: formData.contact_name || null,
        reward_amount: formData.reward_amount || null,
        reward_description: formData.reward_description || null,
      }
    ])
    .select('id')
    .single()

  if (error) {
    console.error('[createLostFoundReport Error]:', error)
    return { error: error.message, petId: null }
  }

  revalidatePath('/lost-found')
  return { error: null, petId: data?.id }
}

// ─── Subir imágenes ───────────────────────────────────────────────────────────

export async function addLostFoundImage(
  petId: string,
  imageUrl: string,
  position: number = 0
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('lost_found_pet_images')
    .insert([
      {
        pet_id: petId,
        image_url: imageUrl,
        position,
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('[addLostFoundImage Error]:', error)
    return { error: error.message }
  }

  revalidatePath('/lost-found')
  return { error: null, image: data }
}

// ─── Responder a un reporte ────────────────────────────────────────────────────

export async function respondToLostFound(
  lostFoundId: string,
  message: string,
  locationDetails?: string,
  photoUrl?: string
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado' }
  }

  // Obtener la información del reporte para saber quién es el reporter
  const { data: lostFound } = await supabase
    .from('lost_found_pets')
    .select('reporter_id')
    .eq('id', lostFoundId)
    .single()

  if (!lostFound) {
    return { error: 'Reporte no encontrado' }
  }

  const { error } = await supabase
    .from('lost_found_responses')
    .insert([
      {
        lost_found_id: lostFoundId,
        responder_id: user.id,
        reporter_id: lostFound.reporter_id,
        message,
        location_details: locationDetails || null,
        photo_url: photoUrl || null,
      }
    ])

  if (error) {
    console.error('[respondToLostFound Error]:', error)
    return { error: error.message }
  }

  revalidatePath(`/lost-found/${lostFoundId}`)
  return { error: null }
}

// ─── Actualizar estado del reporte ─────────────────────────────────────────────

export async function updateLostFoundStatus(
  petId: string,
  status: 'active' | 'found' | 'resolved'
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado' }
  }

  // Verificar que el usuario es el propietario del reporte
  const { data: lostFound } = await supabase
    .from('lost_found_pets')
    .select('reporter_id')
    .eq('id', petId)
    .single()

  if (lostFound?.reporter_id !== user.id) {
    return { error: 'No tienes permiso para actualizar este reporte' }
  }

  const { error } = await supabase
    .from('lost_found_pets')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', petId)

  if (error) {
    console.error('[updateLostFoundStatus Error]:', error)
    return { error: error.message }
  }

  revalidatePath('/lost-found')
  revalidatePath(`/lost-found/${petId}`)
  return { error: null }
}

// ─── Obtener mis reportes ─────────────────────────────────────────────────────

export async function getMyLostFoundReports() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { pets: [], error: 'No autenticado' }
  }

  const { data, error } = await supabase
    .from('lost_found_pets')
    .select(`
      *,
      images:lost_found_pet_images(id, image_url, position),
      responses:lost_found_responses(id)
    `)
    .eq('reporter_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[getMyLostFoundReports Error]:', error)
    return { pets: [], error: error.message }
  }

  const formattedData = data?.map((pet: any) => ({
    ...pet,
    response_count: pet.responses?.length || 0
  })) ?? []

  return { pets: formattedData, error: null }
}

// ─── Actualizar respuesta a un reporte ─────────────────────────────────────────

export async function updateResponseStatus(
  responseId: string,
  status: string
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado' }
  }

  // Verificar que el usuario es el reporter del reporte asociado
  const { data: response } = await supabase
    .from('lost_found_responses')
    .select('reporter_id')
    .eq('id', responseId)
    .single()

  if (response?.reporter_id !== user.id) {
    return { error: 'No tienes permiso para actualizar esta respuesta' }
  }

  const { error } = await supabase
    .from('lost_found_responses')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', responseId)

  if (error) {
    console.error('[updateResponseStatus Error]:', error)
    return { error: error.message }
  }

  revalidatePath('/lost-found')
  return { error: null }
}

// ─── Eliminar reporte ─────────────────────────────────────────────────────────

export async function deleteLostFoundReport(petId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado' }
  }

  // Verificar que el usuario es el propietario del reporte
  const { data: lostFound } = await supabase
    .from('lost_found_pets')
    .select('reporter_id')
    .eq('id', petId)
    .single()

  if (lostFound?.reporter_id !== user.id) {
    return { error: 'No tienes permiso para eliminar este reporte' }
  }

  const { error } = await supabase
    .from('lost_found_pets')
    .delete()
    .eq('id', petId)

  if (error) {
    console.error('[deleteLostFoundReport Error]:', error)
    return { error: error.message }
  }

  revalidatePath('/lost-found')
  return { error: null }
}
