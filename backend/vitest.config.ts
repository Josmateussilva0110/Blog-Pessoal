import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    // Valores de teste: o env.ts valida na carga e encerra o processo se faltar algo
    env: {
      NODE_ENV: "test",
      SUPABASE_URL: "http://localhost:54321",
      SUPABASE_ANON_KEY: "test-anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
      SUPABASE_JWT_SECRET: "test-jwt-secret",
      ADMIN_USER_ID: "11111111-1111-4111-8111-111111111111",
      ALLOWED_ORIGINS: "http://localhost:5173",
    },
  },
})
