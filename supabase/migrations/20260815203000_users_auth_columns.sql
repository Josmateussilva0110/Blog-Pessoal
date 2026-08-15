-- Coluna usada pelo backend de auth (troca obrigatória de senha)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false;
