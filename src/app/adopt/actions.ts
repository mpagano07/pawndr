'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import type { AdoptionFilters } from '@/types'

// ─── Feed de adopciones ───────────────────────────────────────────────────────

export async function getAdoptionFeed(
  filters: AdoptionFilters = {},
  page = 0,
  pageSize = 12
) {
  const supabase = createClient()

  let query = supabase
    .from('adoption_pets')
    .select(`
      *,
      images:adoption_pet_images(id, image_url, position),
      owner:owner_id(
        id, username, full_name, avatar_url,
        shelter:shelters(id, organization_name, verified, shelter_type)
      )
    `)
    .eq('adoption_status', 'available')
    .order('urgent', { ascending: false })
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1)

  if (filters.species) query = query.eq('species', filters.species)
  if (filters.size) query = query.eq('size', filters.size)
  if (filters.gender) query = query.eq('gender', filters.gender)
  if (filters.maxAge != null) query = query.lte('age', filters.maxAge)
  if (filters.minAge != null) query = query.gte('age', filters.minAge)
  if (filters.energyLevel != null) query = query.eq('energy_level', filters.energyLevel)
  if (filters.vaccinated) query = query.eq('vaccinated', true)
  if (filters.neutered) query = query.eq('neutered', true)
  if (filters.goodWithDogs) query = query.eq('good_with_dogs', true)
  if (filters.goodWithCats) query = query.eq('good_with_cats', true)
  if (filters.goodWithKids) query = query.eq('good_with_kids', true)
  if (filters.apartmentFriendly) query = query.eq('apartment_friendly', true)
  if (filters.urgent) query = query.eq('urgent', true)
  if (filters.city) query = query.ilike('city', `%${filters.city}%`)

  const { data, error } = await query

  if (error) {
    console.error('[getAdoptionFeed Error]:', error)
    return { pets: [], error: error.message }
  }

  const formattedData = data?.map((pet: any) => ({
    ...pet,
    shelter: pet.owner?.shelter ? (Array.isArray(pet.owner.shelter) ? pet.owner.shelter[0] : pet.owner.shelter) : null
  })) ?? []

  return { pets: formattedData, error: null }
}

// ─── Detalle de mascota ───────────────────────────────────────────────────────

export async function getAdoptionPetById(id: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('adoption_pets')
    .select(`
      *,
      images:adoption_pet_images(id, image_url, position),
      owner:owner_id(
        id, username, full_name, avatar_url, bio,
        shelter:shelters(id, organization_name, verified, shelter_type, description, website, instagram)
      )
    `)
    .eq('id', id)
    .single()

  if (error || !data) return { pet: null, error: error?.message || 'Mascota no encontrada' }

  const formattedPet = {
    ...data,
    shelter: data.owner?.shelter ? (Array.isArray(data.owner.shelter) ? data.owner.shelter[0] : data.owner.shelter) : null
  }

  return { pet: formattedPet, error: null }
}

// ─── Favoritos ────────────────────────────────────────────────────────────────

export async function toggleFavorite(adoptionPetId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // Verificar si ya es favorito
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('adoption_pet_id', adoptionPetId)
    .maybeSingle()

  if (existing) {
    await supabase.from('favorites').delete().eq('id', existing.id)
    return { favorited: false }
  } else {
    await supabase.from('favorites').insert({ user_id: user.id, adoption_pet_id: adoptionPetId })
    return { favorited: true }
  }
}

export async function getFavorites() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { pets: [], error: 'No autenticado' }

  const { data, error } = await supabase
    .from('favorites')
    .select(`
      id,
      adoption_pet_id,
      created_at,
      pet:adoption_pet_id(
        id, name, species, breed, age, age_unit, size, gender,
        vaccinated, neutered, urgent, city, adoption_status,
        images:adoption_pet_images(id, image_url, position)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[getFavorites Error]:', error)
    return { pets: [], error: error.message }
  }
  return { pets: data ?? [], error: null }
}

export async function getUserFavoriteIds(): Promise<string[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('favorites')
    .select('adoption_pet_id')
    .eq('user_id', user.id)

  return data?.map(f => f.adoption_pet_id) ?? []
}

// ─── Solicitud de adopción ────────────────────────────────────────────────────

export async function sendAdoptionRequest(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const petId = formData.get('pet_id') as string
  const ownerId = formData.get('owner_id') as string
  const phone = formData.get('phone') as string
  const experience = formData.get('experience') as string
  const housingType = formData.get('housing_type') as string
  const otherPets = formData.get('other_pets') as string
  const message = formData.get('message') as string

  // Verificar si ya existe una solicitud
  const { data: existing } = await supabase
    .from('adoption_requests')
    .select('id, status')
    .eq('pet_id', petId)
    .eq('requester_id', user.id)
    .maybeSingle()

  if (existing) {
    return { error: `Ya enviaste una solicitud para esta mascota (Estado: ${existing.status})` }
  }

  const { error } = await supabase
    .from('adoption_requests')
    .insert({
      pet_id: petId,
      requester_id: user.id,
      owner_id: ownerId,
      phone,
      experience,
      housing_type: housingType || 'apartment',
      other_pets: otherPets,
      message,
    })

  if (error) {
    console.error('[sendAdoptionRequest Error]:', error)
    return { error: error.message }
  }

  revalidatePath(`/adopt/${petId}`)
  return { success: true }
}

export async function updateAdoptionRequestStatus(
  requestId: string,
  status: 'accepted' | 'rejected'
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('adoption_requests')
    .update({ status })
    .eq('id', requestId)
    .eq('owner_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/adopt/my-pets')
  return { success: true }
}

// ─── Publicar mascota en adopción ─────────────────────────────────────────────

export async function publishAdoptionPet(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const name = formData.get('name') as string
  const species = formData.get('species') as string
  const breed = formData.get('breed') as string
  const ageRaw = formData.get('age') as string
  const ageUnit = (formData.get('age_unit') as string) || 'months'
  const size = formData.get('size') as string
  const gender = formData.get('gender') as string
  const description = formData.get('description') as string
  const city = formData.get('city') as string
  const country = formData.get('country') as string
  const energyLevel = parseInt(formData.get('energy_level') as string || '3')
  const vaccinated = formData.get('vaccinated') === 'true'
  const neutered = formData.get('neutered') === 'true'
  const goodWithDogs = formData.get('good_with_dogs') === 'true'
  const goodWithCats = formData.get('good_with_cats') === 'true'
  const goodWithKids = formData.get('good_with_kids') === 'true'
  const apartmentFriendly = formData.get('apartment_friendly') === 'true'
  const urgent = formData.get('urgent') === 'true'
  const specialNeeds = formData.get('special_needs') as string

  const age = ageRaw ? parseInt(ageRaw) : null

  // Insertar mascota
  const { data: pet, error: petError } = await supabase
    .from('adoption_pets')
    .insert({
      owner_id: user.id,
      name,
      species: species || 'dog',
      breed,
      age,
      age_unit: ageUnit,
      size: size || 'medium',
      gender,
      description,
      city,
      country: country || 'Argentina',
      energy_level: energyLevel,
      vaccinated,
      neutered,
      good_with_dogs: goodWithDogs,
      good_with_cats: goodWithCats,
      good_with_kids: goodWithKids,
      apartment_friendly: apartmentFriendly,
      urgent,
      special_needs: specialNeeds,
      adoption_status: 'available',
    })
    .select('id')
    .single()

  if (petError || !pet) {
    console.error('[publishAdoptionPet Error]:', petError)
    return { error: petError?.message || 'Error al publicar mascota' }
  }

  // Subir imágenes
  const photos = formData.getAll('photos') as File[]
  let position = 0

  for (const photo of photos.slice(0, 5)) {
    if (photo.size === 0) continue
    const ext = photo.name.split('.').pop()
    const fileName = `${user.id}/${pet.id}/${Date.now()}_${position}.${ext}`

    const { error: uploadErr, data: uploadData } = await supabase.storage
      .from('adoption')
      .upload(fileName, photo, { cacheControl: '3600', upsert: false })

    if (!uploadErr && uploadData) {
      const { data: urlData } = supabase.storage.from('adoption').getPublicUrl(fileName)
      await supabase.from('adoption_pet_images').insert({
        pet_id: pet.id,
        image_url: urlData.publicUrl,
        position,
      })
      position++
    }
  }

  revalidatePath('/adopt')
  revalidatePath('/adopt/my-pets')
  return { success: true, petId: pet.id }
}

// ─── Mis mascotas en adopción + solicitudes recibidas ─────────────────────────

export async function getMyAdoptionPets() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { pets: [], error: 'No autenticado' }

  const { data, error } = await supabase
    .from('adoption_pets')
    .select(`
      *,
      images:adoption_pet_images(id, image_url, position),
      requests:adoption_requests(id, status, requester_id, created_at, phone, experience, housing_type, other_pets, message,
        requester:requester_id(id, username, full_name, avatar_url)
      )
    `)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return { pets: [], error: error.message }
  return { pets: data ?? [], error: null }
}

export async function deleteAdoptionPet(petId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('adoption_pets')
    .delete()
    .eq('id', petId)
    .eq('owner_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/adopt/my-pets')
  return { success: true }
}
