-- Tasks jadvaliga qo'shimcha ustunlar qo'shish
ALTER TABLE public.tasks 
  ADD COLUMN IF NOT EXISTS task_name TEXT,
  ADD COLUMN IF NOT EXISTS goal_value INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unit TEXT,
  ADD COLUMN IF NOT EXISTS actual_value INTEGER DEFAULT 0;

-- title ustunini optional qilish va task_name ishlatish
ALTER TABLE public.tasks ALTER COLUMN title DROP NOT NULL;

-- Eski title ma'lumotlarini task_name ga ko'chirish (agar mavjud bo'lsa)
UPDATE public.tasks SET task_name = title WHERE task_name IS NULL;
