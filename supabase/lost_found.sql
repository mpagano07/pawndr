-- ================================================================
-- Pawndr — Módulo de Mascotas Perdidas y Encontradas v1
-- Ejecutar en Supabase SQL Editor
-- ================================================================

-- ========================
-- ENUMS
-- ========================
DO $$ BEGIN
  CREATE TYPE public.lost_found_status AS ENUM ('active', 'found', 'resolved');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.lost_found_type AS ENUM ('lost', 'found');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ========================
-- TABLA: lost_found_pets
-- ========================
CREATE TABLE IF NOT EXISTS public.lost_found_pets (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type             public.lost_found_type NOT NULL,  -- 'lost' o 'found'
  name             TEXT NOT NULL,
  description      TEXT NOT NULL,
  species          TEXT NOT NULL DEFAULT 'dog',   -- dog, cat, rabbit, bird, other
  breed            TEXT,
  color            TEXT,                          -- colores o características visuales
  gender           TEXT,                          -- male, female, unknown
  age_description  TEXT,                          -- ej: "joven", "adulto", "mayor"
  distinguishing_features TEXT,                   -- cicatrices, manchas, collar, etc.
  status           public.lost_found_status DEFAULT 'active',
  
  -- Ubicación
  last_seen_location TEXT NOT NULL,               -- dirección aproximada
  latitude         DOUBLE PRECISION,
  longitude        DOUBLE PRECISION,
  location         GEOGRAPHY(Point, 4326),
  city             TEXT,
  country          TEXT DEFAULT 'Argentina',
  
  -- Fecha de pérdida/hallazgo
  date_lost_or_found TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Contacto
  phone            TEXT,
  whatsapp         TEXT,
  email            TEXT,
  contact_name     TEXT,
  
  -- Reward
  reward_amount    INTEGER,                       -- monto en pesos
  reward_description TEXT,
  
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- ========================
-- TABLA: lost_found_pet_images
-- ========================
CREATE TABLE IF NOT EXISTS public.lost_found_pet_images (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id    UUID NOT NULL REFERENCES public.lost_found_pets(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  position  INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- ========================
-- TABLA: lost_found_responses
-- ========================
CREATE TABLE IF NOT EXISTS public.lost_found_responses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lost_found_id   UUID NOT NULL REFERENCES public.lost_found_pets(id) ON DELETE CASCADE,
  responder_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reporter_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message         TEXT NOT NULL,                  -- descripción de por qué creen que es su mascota
  location_details TEXT,                          -- dónde exactamente vieron al animal
  photo_url       TEXT,                           -- foto del animal visto
  status          TEXT DEFAULT 'unreviewed',      -- 'unreviewed', 'contacted', 'resolved'
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- ========================
-- INDICES
-- ========================
CREATE INDEX IF NOT EXISTS idx_lost_found_reporter ON public.lost_found_pets(reporter_id);
CREATE INDEX IF NOT EXISTS idx_lost_found_status ON public.lost_found_pets(status);
CREATE INDEX IF NOT EXISTS idx_lost_found_type ON public.lost_found_pets(type);
CREATE INDEX IF NOT EXISTS idx_lost_found_city ON public.lost_found_pets(city);
CREATE INDEX IF NOT EXISTS idx_lost_found_date ON public.lost_found_pets(date_lost_or_found);
CREATE INDEX IF NOT EXISTS idx_lost_found_location ON public.lost_found_pets USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_lost_found_responses ON public.lost_found_responses(lost_found_id);

-- ========================
-- ROW LEVEL SECURITY (RLS)
-- ========================
ALTER TABLE public.lost_found_pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_found_pet_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_found_responses ENABLE ROW LEVEL SECURITY;

-- lost_found_pets policies
CREATE POLICY "lost_found_pets_select_public" ON public.lost_found_pets
  FOR SELECT USING (true);

CREATE POLICY "lost_found_pets_insert_own" ON public.lost_found_pets
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "lost_found_pets_update_own" ON public.lost_found_pets
  FOR UPDATE USING (auth.uid() = reporter_id);

CREATE POLICY "lost_found_pets_delete_own" ON public.lost_found_pets
  FOR DELETE USING (auth.uid() = reporter_id);

-- lost_found_pet_images policies
CREATE POLICY "lost_found_pet_images_select_public" ON public.lost_found_pet_images
  FOR SELECT USING (true);

CREATE POLICY "lost_found_pet_images_insert_own" ON public.lost_found_pet_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lost_found_pets
      WHERE id = pet_id AND reporter_id = auth.uid()
    )
  );

CREATE POLICY "lost_found_pet_images_delete_own" ON public.lost_found_pet_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.lost_found_pets
      WHERE id = pet_id AND reporter_id = auth.uid()
    )
  );

-- lost_found_responses policies
CREATE POLICY "lost_found_responses_select_related" ON public.lost_found_responses
  FOR SELECT USING (
    auth.uid() = responder_id OR auth.uid() = reporter_id
  );

CREATE POLICY "lost_found_responses_insert_own" ON public.lost_found_responses
  FOR INSERT WITH CHECK (auth.uid() = responder_id);

CREATE POLICY "lost_found_responses_update_own" ON public.lost_found_responses
  FOR UPDATE USING (auth.uid() = responder_id OR auth.uid() = reporter_id);

CREATE POLICY "lost_found_responses_delete_own" ON public.lost_found_responses
  FOR DELETE USING (auth.uid() = responder_id OR auth.uid() = reporter_id);
