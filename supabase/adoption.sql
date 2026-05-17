-- ================================================================
-- Pawndr — Módulo de Adopciones v1
-- Ejecutar en Supabase SQL Editor
-- ================================================================

-- ========================
-- ENUMS
-- ========================
DO $$ BEGIN
  CREATE TYPE public.adoption_size AS ENUM ('small', 'medium', 'large', 'xlarge');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.adoption_status AS ENUM ('available', 'pending', 'adopted');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.adoption_request_status AS ENUM ('pending', 'accepted', 'rejected');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.housing_type AS ENUM ('apartment', 'house', 'farm', 'other');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ========================
-- TABLA: adoption_pets
-- ========================
CREATE TABLE IF NOT EXISTS public.adoption_pets (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  description      TEXT,
  species          TEXT NOT NULL DEFAULT 'dog',   -- dog, cat, rabbit, bird, other
  breed            TEXT,
  age              INTEGER,                        -- en meses para precisión
  age_unit         TEXT DEFAULT 'months',          -- 'months' o 'years'
  size             public.adoption_size DEFAULT 'medium',
  gender           public.pet_gender NOT NULL,
  energy_level     INTEGER DEFAULT 3 CHECK (energy_level BETWEEN 1 AND 5),
  vaccinated       BOOLEAN DEFAULT false,
  neutered         BOOLEAN DEFAULT false,
  good_with_dogs   BOOLEAN DEFAULT true,
  good_with_cats   BOOLEAN DEFAULT true,
  good_with_kids   BOOLEAN DEFAULT true,
  apartment_friendly BOOLEAN DEFAULT true,
  special_needs    TEXT,
  adoption_status  public.adoption_status DEFAULT 'available',
  urgent           BOOLEAN DEFAULT false,
  city             TEXT,
  country          TEXT DEFAULT 'Argentina',
  latitude         DOUBLE PRECISION,
  longitude        DOUBLE PRECISION,
  location         GEOGRAPHY(Point, 4326),
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- ========================
-- TABLA: adoption_pet_images
-- ========================
CREATE TABLE IF NOT EXISTS public.adoption_pet_images (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id    UUID NOT NULL REFERENCES public.adoption_pets(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  position  INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- ========================
-- TABLA: adoption_requests
-- ========================
CREATE TABLE IF NOT EXISTS public.adoption_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id          UUID NOT NULL REFERENCES public.adoption_pets(id) ON DELETE CASCADE,
  requester_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  owner_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  phone           TEXT,           -- teléfono / whatsapp de contacto
  experience      TEXT,           -- experiencia previa con mascotas
  housing_type    public.housing_type DEFAULT 'apartment',
  other_pets      TEXT,           -- descripción de otras mascotas
  message         TEXT,           -- mensaje personalizado
  status          public.adoption_request_status DEFAULT 'pending',
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE(pet_id, requester_id)
);

-- ========================
-- TABLA: shelters
-- ========================
CREATE TABLE IF NOT EXISTS public.shelters (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_name TEXT NOT NULL,
  verified          BOOLEAN DEFAULT false,
  shelter_type      TEXT DEFAULT 'shelter',   -- 'shelter', 'rescue', 'foster'
  description       TEXT,
  website           TEXT,
  instagram         TEXT,
  phone             TEXT,
  city              TEXT,
  country           TEXT DEFAULT 'Argentina',
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- ========================
-- TABLA: favorites
-- ========================
CREATE TABLE IF NOT EXISTS public.favorites (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  adoption_pet_id UUID NOT NULL REFERENCES public.adoption_pets(id) ON DELETE CASCADE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE(user_id, adoption_pet_id)
);

-- ========================
-- ÍNDICES
-- ========================
CREATE INDEX IF NOT EXISTS idx_adoption_pets_owner_id ON public.adoption_pets(owner_id);
CREATE INDEX IF NOT EXISTS idx_adoption_pets_status ON public.adoption_pets(adoption_status);
CREATE INDEX IF NOT EXISTS idx_adoption_pets_species ON public.adoption_pets(species);
CREATE INDEX IF NOT EXISTS idx_adoption_pets_urgent ON public.adoption_pets(urgent) WHERE urgent = true;
CREATE INDEX IF NOT EXISTS idx_adoption_pets_location ON public.adoption_pets USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_adoption_pet_images_pet_id ON public.adoption_pet_images(pet_id, position);
CREATE INDEX IF NOT EXISTS idx_adoption_requests_pet_id ON public.adoption_requests(pet_id);
CREATE INDEX IF NOT EXISTS idx_adoption_requests_requester_id ON public.adoption_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_adoption_requests_owner_id ON public.adoption_requests(owner_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_pet_id ON public.favorites(adoption_pet_id);
CREATE INDEX IF NOT EXISTS idx_shelters_user_id ON public.shelters(user_id);
CREATE INDEX IF NOT EXISTS idx_shelters_verified ON public.shelters(verified) WHERE verified = true;

-- ========================
-- ROW LEVEL SECURITY
-- ========================
ALTER TABLE public.adoption_pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adoption_pet_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adoption_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shelters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- adoption_pets: cualquiera puede ver mascotas disponibles
CREATE POLICY "adoption_pets_select_public"
  ON public.adoption_pets FOR SELECT USING (true);

CREATE POLICY "adoption_pets_insert_own"
  ON public.adoption_pets FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "adoption_pets_update_own"
  ON public.adoption_pets FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "adoption_pets_delete_own"
  ON public.adoption_pets FOR DELETE USING (auth.uid() = owner_id);

-- adoption_pet_images: públicas para SELECT, propietario gestiona
CREATE POLICY "adoption_images_select_public"
  ON public.adoption_pet_images FOR SELECT USING (true);

CREATE POLICY "adoption_images_insert_own"
  ON public.adoption_pet_images FOR INSERT
  WITH CHECK (
    pet_id IN (SELECT id FROM public.adoption_pets WHERE owner_id = auth.uid())
  );

CREATE POLICY "adoption_images_delete_own"
  ON public.adoption_pet_images FOR DELETE
  USING (
    pet_id IN (SELECT id FROM public.adoption_pets WHERE owner_id = auth.uid())
  );

-- adoption_requests: requester ve las suyas, owner ve las de sus mascotas
CREATE POLICY "adoption_requests_select_own"
  ON public.adoption_requests FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = owner_id);

CREATE POLICY "adoption_requests_insert"
  ON public.adoption_requests FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "adoption_requests_update_owner"
  ON public.adoption_requests FOR UPDATE
  USING (auth.uid() = owner_id);

-- shelters: públicos para SELECT
CREATE POLICY "shelters_select_public"
  ON public.shelters FOR SELECT USING (true);

CREATE POLICY "shelters_insert_own"
  ON public.shelters FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "shelters_update_own"
  ON public.shelters FOR UPDATE USING (auth.uid() = user_id);

-- favorites: cada usuario gestiona los suyos
CREATE POLICY "favorites_select_own"
  ON public.favorites FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "favorites_insert_own"
  ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favorites_delete_own"
  ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- ========================
-- TRIGGER: updated_at en adoption_pets
-- ========================
CREATE OR REPLACE FUNCTION public.update_adoption_pet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER adoption_pet_updated_at
  BEFORE UPDATE ON public.adoption_pets
  FOR EACH ROW EXECUTE FUNCTION public.update_adoption_pet_updated_at();

-- ========================
-- STORAGE BUCKET: adoption
-- ========================
INSERT INTO storage.buckets (id, name, public)
  VALUES ('adoption', 'adoption', true)
  ON CONFLICT DO NOTHING;

CREATE POLICY "adoption_images_public_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'adoption');

CREATE POLICY "adoption_images_auth_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'adoption' AND auth.role() = 'authenticated');

CREATE POLICY "adoption_images_own_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'adoption' AND auth.uid()::text = (storage.foldername(name))[1]);
