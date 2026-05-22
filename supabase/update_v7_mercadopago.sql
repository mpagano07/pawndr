-- Add Mercado Pago subscription tracking fields to services table
ALTER TABLE IF EXISTS public.services
  ADD COLUMN IF NOT EXISTS mp_preapproval_id TEXT,
  ADD COLUMN IF NOT EXISTS mp_status TEXT,
  ADD COLUMN IF NOT EXISTS mp_payer_email TEXT;
