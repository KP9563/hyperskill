-- Add hours_taught and price_per_session columns to teachers table
ALTER TABLE public.teachers 
ADD COLUMN hours_taught integer DEFAULT 0,
ADD COLUMN price_per_session decimal(10,2) DEFAULT 0;