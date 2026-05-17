-- ================================================================
-- Pawndr — Módulo de Adopciones: Añadir Teléfono en Solicitudes
-- Ejecutar en Supabase SQL Editor
-- ================================================================

ALTER TABLE public.adoption_requests ADD COLUMN IF NOT EXISTS phone TEXT;
