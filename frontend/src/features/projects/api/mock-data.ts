import type { Project } from "@blog/shared";

export const MOCK_PROJECTS: Project[] = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    slug: "taskflow",
    title: "TaskFlow",
    summary: "Gerenciador de tarefas colaborativo com kanban e tempo real.",
    description:
      "App web para equipes pequenas organizarem sprints com boards kanban, notificações em tempo real via WebSocket e integração com calendário. Inspirado em ferramentas como Trello, mas com foco em simplicidade.",
    status: "active",
    tags: ["produtividade", "colaboração"],
    techStack: ["React", "Node.js", "PostgreSQL", "Socket.io"],
    repoUrl: "https://github.com",
    liveUrl: "https://example.com",
    featured: true,
    createdAt: "2025-11-10T10:00:00.000Z",
    updatedAt: "2026-02-20T14:30:00.000Z",
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    slug: "weather-dash",
    title: "WeatherDash",
    summary: "Dashboard meteorológico com previsões e mapas interativos.",
    description:
      "Painel que consome APIs de clima para exibir previsões de 7 dias, alertas meteorológicos e mapas de temperatura. Interface responsiva com gráficos animados.",
    status: "active",
    tags: ["dados", "visualização"],
    techStack: ["Next.js", "TypeScript", "Chart.js", "OpenWeather API"],
    repoUrl: "https://github.com",
    liveUrl: "https://example.com",
    featured: true,
    createdAt: "2025-09-05T08:00:00.000Z",
    updatedAt: "2026-01-15T09:00:00.000Z",
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    slug: "devlog-api",
    title: "DevLog API",
    summary: "API REST para registrar e publicar logs de desenvolvimento.",
    description:
      "Backend tipado com autenticação JWT, CRUD de posts técnicos e suporte a markdown. Pensado como motor de um blog de engenharia.",
    status: "wip",
    tags: ["backend", "api"],
    techStack: ["Express", "TypeScript", "Supabase", "Zod"],
    repoUrl: "https://github.com",
    featured: false,
    createdAt: "2026-01-20T12:00:00.000Z",
    updatedAt: "2026-03-01T18:00:00.000Z",
  },
  {
    id: "d4e5f6a7-b8c9-0123-def0-234567890123",
    slug: "pixel-snake",
    title: "Pixel Snake",
    summary: "Jogo snake retrô feito com canvas e game loop otimizado.",
    description:
      "Releitura clássica do Snake com estética pixel art, ranking local e modos de dificuldade. Projeto para estudar performance em canvas.",
    status: "archived",
    tags: ["jogos", "canvas"],
    techStack: ["Vanilla JS", "Canvas API", "Vite"],
    repoUrl: "https://github.com",
    liveUrl: "https://example.com",
    featured: false,
    createdAt: "2024-06-01T10:00:00.000Z",
    updatedAt: "2024-08-10T10:00:00.000Z",
  },
];

export function getMockProjectBySlug(slug: string): Project | undefined {
  return MOCK_PROJECTS.find((p) => p.slug === slug);
}

export function getMockFeaturedProjects(): Project[] {
  return MOCK_PROJECTS.filter((p) => p.featured);
}
