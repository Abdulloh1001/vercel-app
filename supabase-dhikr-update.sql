-- Dhikr jadvaliga icon ustuni qo'shish
ALTER TABLE public.dhikr 
  ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '';
