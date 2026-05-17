export interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  location: any | null
  created_at: string
  updated_at: string
}

export interface Pet {
  id: string
  owner_id: string
  name: string
  breed: string | null
  species: string | null
  age: number | null
  gender: 'male' | 'female'
  photos: string[]
  bio: string | null
  temperament?: string[]
  activity_level?: number
  kids_friendly?: boolean
  housing?: string
  genetic_info?: string | null
  behavior_prediction?: string | null
  created_at: string
}

export interface Swipe {
  id: string
  swiper_pet_id: string
  swiped_pet_id: string
  action: 'like' | 'dislike'
  created_at: string
}

export interface Match {
  id: string
  pet1_id: string
  pet2_id: string
  created_at: string
  pet1?: Pet
  pet2?: Pet
}

export interface Message {
  id: string
  match_id: string
  sender_id: string
  content: string
  reply_to_id?: string
  likes?: string[]
  created_at: string
  is_read?: boolean
}

export type ReportReason =
  | 'spam'
  | 'inappropriate_content'
  | 'fake_profile'
  | 'abusive_behavior'
  | 'other'

export type ReportStatus = 'pending' | 'reviewed' | 'dismissed' | 'actioned'

export interface Report {
  id: string
  reporter_id: string
  reported_pet_id: string
  reason: ReportReason
  description: string | null
  status: ReportStatus
  created_at: string
  reporter?: Profile
  reported_pet?: Pet
}

// ========================
// Adoption Module Types
// ========================

export type AdoptionSize = 'small' | 'medium' | 'large' | 'xlarge'
export type AdoptionStatus = 'available' | 'pending' | 'adopted'
export type AdoptionRequestStatus = 'pending' | 'accepted' | 'rejected'
export type HousingType = 'apartment' | 'house' | 'farm' | 'other'
export type ShelterType = 'shelter' | 'rescue' | 'foster'

export interface AdoptionPetImage {
  id: string
  pet_id: string
  image_url: string
  position: number
  created_at: string
}

export interface AdoptionPet {
  id: string
  owner_id: string
  name: string
  description: string | null
  species: string
  breed: string | null
  age: number | null
  age_unit: 'months' | 'years'
  size: AdoptionSize
  gender: 'male' | 'female'
  energy_level: number
  vaccinated: boolean
  neutered: boolean
  good_with_dogs: boolean
  good_with_cats: boolean
  good_with_kids: boolean
  apartment_friendly: boolean
  special_needs: string | null
  adoption_status: AdoptionStatus
  urgent: boolean
  city: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  created_at: string
  updated_at: string
  // Joined
  owner?: Profile
  shelter?: Shelter
  images?: AdoptionPetImage[]
}

export interface AdoptionRequest {
  id: string
  pet_id: string
  requester_id: string
  owner_id: string
  experience: string | null
  housing_type: HousingType
  other_pets: string | null
  message: string | null
  status: AdoptionRequestStatus
  created_at: string
  // Joined
  pet?: AdoptionPet
  requester?: Profile
}

export interface Shelter {
  id: string
  user_id: string
  organization_name: string
  verified: boolean
  shelter_type: ShelterType
  description: string | null
  website: string | null
  instagram: string | null
  phone: string | null
  city: string | null
  country: string | null
  created_at: string
}

export interface Favorite {
  id: string
  user_id: string
  adoption_pet_id: string
  created_at: string
  // Joined
  pet?: AdoptionPet
}

export interface AdoptionFilters {
  species?: string
  size?: AdoptionSize
  gender?: string
  maxAge?: number
  minAge?: number
  energyLevel?: number
  vaccinated?: boolean
  neutered?: boolean
  goodWithDogs?: boolean
  goodWithCats?: boolean
  goodWithKids?: boolean
  apartmentFriendly?: boolean
  urgent?: boolean
  city?: string
}

