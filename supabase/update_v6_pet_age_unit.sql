-- ================================================================
-- Pawndr — Añadir unidad de edad a mascotas de usuario
-- Ejecutar en Supabase SQL Editor o mediante migraciones de esquema
-- ================================================================

ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS age_unit TEXT DEFAULT 'years';
