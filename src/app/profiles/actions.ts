'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import fs from 'fs'
import path from 'path'

function logToFile(msg: string) {
  try {
    const logPath = path.join(process.cwd(), 'server-debug.log')
    const time = new Date().toISOString()
    fs.appendFileSync(logPath, `[${time}] ${msg}\n`, 'utf8')
  } catch (err) {
    console.error('Failed to write log to file:', err)
  }
}

export async function updateProfile(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  const fullName = formData.get('full_name') as string
  const bio = formData.get('bio') as string
  const usernameRaw = formData.get('username') as string
  const username = usernameRaw ? usernameRaw.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') : ''

  if (!username) {
    return { error: 'El nombre de usuario no puede estar vacío.' }
  }

  // Verificar si el username ya existe en otro perfil
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .neq('id', user.id)
    .maybeSingle()

  if (existing) {
    return { error: 'Este nombre de usuario ya está en uso por otra persona.' }
  }

  // Manejo de la foto de perfil (avatar)
  const avatarUrl = formData.get('avatar_url') as string | undefined

  const updateData: any = {
    username,
    full_name: fullName,
    bio,
    updated_at: new Date().toISOString(),
  }

  if (avatarUrl) {
    updateData.avatar_url = avatarUrl
  }

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id)

  if (error) {
    console.error('[updateProfile Error]:', error)
    return { error: error.message }
  }

  revalidatePath('/profiles')
  return { success: true }
}

export async function addPet(formData: FormData) {
  logToFile('[addPet Action] Executing...')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    logToFile('[addPet Error]: User is not authenticated')
    return { error: 'Not authenticated' }
  }

  const name = formData.get('name') as string
  const species = formData.get('species') as string
  const breed = formData.get('breed') as string
  const age = parseInt(formData.get('age') as string)
  const ageUnit = (formData.get('age_unit') as string) || 'years'
  const gender = formData.get('gender') as string
  const bio = formData.get('bio') as string
  const vaccinated = formData.get('vaccinated') === 'true'
  const size = formData.get('size') as string
  const pedigree = formData.get('pedigree') === 'true'
  const medicalNotes = formData.get('medical_notes') as string
  const housing = formData.get('housing') as string
  const activityLevel = parseInt(formData.get('activity_level') as string || '3')
  const kidsFriendly = formData.get('kids_friendly') === 'true'
  const temperamentRaw = formData.get('temperament') as string
  const temperament = temperamentRaw ? temperamentRaw.split(',').map(t => t.trim()).filter(Boolean) : []
  const geneticInfo = formData.get('genetic_info') as string
  const behaviorPrediction = formData.get('behavior_prediction') as string
  
  const photosArray = JSON.parse(formData.get('photos') as string || '[]') as string[]

  logToFile(`[addPet Action] User ID: ${user.id}`)
  logToFile(`[addPet Action] Form fields: ${JSON.stringify({ name, species, breed, age, gender, vaccinated, size, pedigree, housing, activityLevel, kidsFriendly, temperament, geneticInfo, behaviorPrediction })}`)
  logToFile(`[addPet Action] Photos array received: ${JSON.stringify(photosArray)}`)

  const insertPayload = {
    owner_id: user.id,
    name,
    species: species || 'other',
    breed,
    age,
    gender,
    bio,
    vaccinated,
    size: size || 'medium',
    pedigree,
    medical_notes: medicalNotes,
    housing: housing || 'both',
    activity_level: activityLevel,
    kids_friendly: kidsFriendly,
    age_unit: ageUnit,
    temperament: temperament,
    genetic_info: geneticInfo,
    behavior_prediction: behaviorPrediction,
    photos: photosArray
  }

  logToFile(`[addPet Action] Inserting payload: ${JSON.stringify(insertPayload)}`)

  const { error } = await supabase
    .from('pets')
    .insert(insertPayload)

  if (error) {
    logToFile(`[addPet Action Database Insert Error]: ${JSON.stringify(error)}`)
    return { error: error.message }
  }

  logToFile('[addPet Action] Database insert successful!')

  revalidatePath('/profiles')
  return { success: true }
}

export async function deletePet(petId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('pets')
    .delete()
    .eq('id', petId)
    .eq('owner_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/profiles')
  return { success: true }
}

export async function updatePet(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const petId = formData.get('id') as string
  const name = formData.get('name') as string
  const species = formData.get('species') as string
  const breed = formData.get('breed') as string
  const age = parseInt(formData.get('age') as string)
  const ageUnit = (formData.get('age_unit') as string) || 'years'
  const gender = formData.get('gender') as string
  const bio = formData.get('bio') as string
  const vaccinated = formData.get('vaccinated') === 'true'
  const size = formData.get('size') as string
  const pedigree = formData.get('pedigree') === 'true'
  const medicalNotes = formData.get('medical_notes') as string
  
  const updateData: any = {
    name,
    species: species || 'other',
    breed,
    age,
    gender,
    bio,
    vaccinated,
    size: size || 'medium',
    pedigree,
    age_unit: ageUnit,
    medical_notes: medicalNotes,
    housing: formData.get('housing') as string || 'both',
    activity_level: parseInt(formData.get('activity_level') as string || '3'),
    kids_friendly: formData.get('kids_friendly') === 'true',
    temperament: (formData.get('temperament') as string || '').split(',').map(t => t.trim()).filter(Boolean),
    genetic_info: formData.get('genetic_info') as string,
    behavior_prediction: formData.get('behavior_prediction') as string,
  }

  const photosArray = JSON.parse(formData.get('photos') as string || '[]') as string[]
  updateData.photos = photosArray

  const { error } = await supabase
    .from('pets')
    .update(updateData)
    .match({ id: petId, owner_id: user.id })

  if (error) {
    console.error('[updatePet Error]:', error)
    return { error: error.message }
  }

  revalidatePath('/profiles')
  return { success: true }
}

export async function updateLocation(lat: number, lng: number) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({ location: `POINT(${lng} ${lat})` })
    .eq('id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}
