-- ==========================================
-- MIGRATION: Eliminar columnas de pago
-- Fecha: 2026-06-16
-- Motivo: La actividad es corporativa y gratuita.
--         No se manejan pagos, referencias ni estados de pago.
-- ==========================================

-- Eliminar columnas de pago de la tabla profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS is_paid;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS payment_status;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS payment_reference;
