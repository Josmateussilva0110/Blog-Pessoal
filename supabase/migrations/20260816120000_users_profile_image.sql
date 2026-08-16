-- Foto de perfil do portfólio (armazenada no banco, gerenciada pelo admin)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS profile_image_data TEXT,
  ADD COLUMN IF NOT EXISTS profile_image_mime TEXT,
  ADD COLUMN IF NOT EXISTS profile_image_updated_at TIMESTAMPTZ;
