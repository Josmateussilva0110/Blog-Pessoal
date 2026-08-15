/**
 * Reseta a senha de um usuário existente.
 *
 * Uso:
 *   npm run reset-user-password -- <email> [nova-senha-temporaria]
 *
 * Requer SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env (raiz ou backend/).
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import path from "path";

const backendRoot = path.resolve(__dirname, "..");
const monorepoRoot = path.resolve(backendRoot, "..");

config({ path: path.join(monorepoRoot, ".env") });
config({ path: path.join(backendRoot, ".env") });

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function generateTemporaryPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  let password = "Aa1!";

  for (let index = password.length; index < 12; index += 1) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }

  return password;
}

async function findUserByEmail(email: string) {
  const { data: profileRow, error: profileError } = await supabaseAdmin
    .from("users")
    .select("id, email")
    .eq("email", email)
    .maybeSingle();

  if (!profileError && profileRow) {
    return profileRow;
  }

  const { data: authList, error: authError } =
    await supabaseAdmin.auth.admin.listUsers();

  if (authError) {
    console.error("Falha ao buscar usuário:", authError.message);
    process.exit(1);
  }

  const authUser = authList.users.find(
    (user) => user.email?.toLowerCase() === email,
  );

  if (!authUser) {
    return null;
  }

  return { id: authUser.id, email: authUser.email ?? email };
}

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  const temporaryPassword = process.argv[3] ?? generateTemporaryPassword();

  if (!email) {
    console.error(
      "Uso: npm run reset-user-password -- <email> [nova-senha-temporaria]",
    );
    process.exit(1);
  }

  const userRow = await findUserByEmail(email);

  if (!userRow) {
    console.error("Usuário não encontrado para o e-mail informado.");
    process.exit(1);
  }

  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
    userRow.id,
    { password: temporaryPassword },
  );

  if (authError) {
    console.error("Falha ao resetar senha:", authError.message);
    process.exit(1);
  }

  const { error: flagError } = await supabaseAdmin
    .from("users")
    .update({ must_change_password: true })
    .eq("id", userRow.id);

  if (flagError) {
    console.warn(
      "Senha resetada, mas não foi possível marcar must_change_password:",
      flagError.message,
    );
    console.warn(
      "Rode a migration supabase/migrations/20260815203000_users_auth_columns.sql no projeto Supabase.",
    );
  }

  console.log(`Senha definida para ${userRow.email}`);
  console.log(`Senha: ${temporaryPassword}`);

  if (!flagError) {
    console.log("O usuário será obrigado a trocar a senha no próximo login.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
