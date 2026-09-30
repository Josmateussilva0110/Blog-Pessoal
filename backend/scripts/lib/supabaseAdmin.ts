/**
 * Cliente admin do Supabase para os scripts de manutenção. Valida só o que os
 * scripts precisam (não exige JWT secret, anon key etc. como a API).
 */
import { createClient } from "@supabase/supabase-js";
import { loadEnvFiles } from "../../src/config/loadEnvFiles";

loadEnvFiles();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env");
  process.exit(1);
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
