# Estrutura de Pastas — Frontend (React + Vite + Tailwind)

Estrutura pensada para um monorepo com **área admin** e **área de visualização pública**, organizada por feature/domínio em vez de por tipo de arquivo.

## Árvore de diretórios

```
frontend/
  src/
    app/                      # bootstrap da aplicação
      App.tsx
      router.tsx              # rotas públicas + admin
      providers.tsx           # contexto global (auth, query client, etc)

    routes/                   # ou "pages/" — separado por área
      public/
        home/
          HomePage.tsx
        project/
          ProjectDetailPage.tsx
      admin/
        dashboard/
          DashboardPage.tsx
        projects/
          ProjectListPage.tsx
          ProjectFormPage.tsx
        login/
          LoginPage.tsx

    features/                 # lógica de domínio reutilizável
      projects/
        components/           # componentes específicos de "project"
        hooks/                # useProjects, useProject, etc
        api/                  # chamadas à API/backend (fetch/react-query)
        types.ts
      auth/
        components/
        hooks/
        api/

    components/                # componentes de UI genéricos, reutilizáveis
      ui/                      # botão, input, modal, card (design system)
      layout/                  # Header, Sidebar, AdminLayout, PublicLayout

    lib/                       # utilitários puros (formatação, helpers)
    config/                    # constantes, env vars tipadas
    styles/                    # tailwind.css, tokens extras

  index.html
  vite.config.ts
  tailwind.config.ts
  tsconfig.json
  package.json

backend/
  ...

packages/
  shared/
    src/
      types/                    # tipos compartilhados (Project, User, etc)
      schemas/                  # validação (zod) compartilhada front/back
      utils/                    # funções puras compartilhadas
    package.json

  ui/                            # opcional: se quiser extrair o design system
    src/
    package.json
```

## Pontos-chave dessa organização

1. **`routes/public` vs `routes/admin`** — separação clara de responsabilidade e, mais importante na prática, facilita aplicar **lazy loading** por área (o bundle do admin não precisa ser carregado por quem só visualiza o blog).

2. **`features/` por domínio** (ex: `projects`, `auth`) em vez de por tipo — quando você mexe na feature "projects", tudo que importa está numa pasta só, incluindo os hooks que chamam a API do backend/Supabase.

3. **`components/ui`** separado dos componentes de feature — aqui fica o design system Tailwind (Button, Input, Badge, etc), reaproveitável tanto no admin quanto no público.

4. **`components/layout`** com `AdminLayout` e `PublicLayout` distintos — sidebar/nav de admin é bem diferente da navegação pública, então dois layouts fazem sentido desde já.

5. **`packages/shared`** guarda tipos e schemas de validação usados tanto no front quanto no back (ex: schema do "Project" com Zod) — evita duplicar tipagem entre frontend e backend TypeScript.

6. **Proteção de rotas admin** — um `ProtectedRoute` dentro de `features/auth` que envolve as rotas de `routes/admin/*`, verificando sessão via Supabase Auth.

