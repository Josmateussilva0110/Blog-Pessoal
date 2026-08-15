/**
 * Cria um novo usuário admin no Supabase Auth.
 * A linha em public.users é criada automaticamente pelo trigger on_auth_user_created.
 *
 * Uso:
 *   npm run create-user -- <email> <username> <senha>
 *
 * Exemplo:
 *   npm run create-user -- admin@blog.com "Mateus" "MinhaSenh@123"
 *
 * Requer SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env (raiz ou backend/).
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import path from "path";
import { RegisterSchema } from "../src/schemas/registerSchema";

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

function printUsage() {
  console.error("Uso: npm run create-user -- <email> <username> <senha>");
  console.error('Exemplo: npm run create-user -- admin@blog.com "Mateus" "MinhaSenh@123"');
}

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  const username = process.argv[3]?.trim();
  const password = process.argv[4];

  if (!email || !username || !password) {
    printUsage();
    process.exit(1);
  }

  const parsed = RegisterSchema.safeParse({ email, username, password });

  if (!parsed.success) {
    console.error("Dados inválidos:");
    for (const issue of parsed.error.issues) {
      console.error(`- ${issue.message}`);
    }
    process.exit(1);
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { username: parsed.data.username },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already")) {
      console.error("Já existe um usuário com este e-mail.");
    } else {
      console.error("Falha ao criar usuário:", error.message);
    }
    process.exit(1);
  }

  if (!data.user?.id) {
    console.error("Usuário criado no Auth, mas sem ID retornado.");
    process.exit(1);
  }

  console.log("Usuário criado com sucesso.");
  console.log(`ID:    ${data.user.id}`);
  console.log(`Email: ${data.user.email}`);
  console.log(`Nome:  ${parsed.data.username}`);
  console.log("O usuário já pode fazer login em /admin/login.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
