-- Migra foto de perfil: base64 no banco → URL do Supabase Storage
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

ALTER TABLE public.users
  DROP COLUMN IF EXISTS profile_image_data,
  DROP COLUMN IF EXISTS profile_image_mime;

-- Bucket público para fotos de perfil do portfólio
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Leitura pública (visitantes do portfólio)
DROP POLICY IF EXISTS "Profile images public read" ON storage.objects;
CREATE POLICY "Profile images public read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'profile-images');
