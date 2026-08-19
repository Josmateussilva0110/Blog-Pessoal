import type { Project } from "@blog/shared";

export const MOCK_PROJECTS: Project[] = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    slug: "taskflow",
    title: "TaskFlow",
    description:
      "App web para equipes pequenas organizarem sprints com boards kanban, notificações em tempo real via WebSocket e integração com calendário. Inspirado em ferramentas como Trello, mas com foco em simplicidade.",
    contentMarkdown:
      "App web para equipes pequenas organizarem sprints com boards kanban, notificações em tempo real via WebSocket e integração com calendário. Inspirado em ferramentas como Trello, mas com foco em simplicidade.",
    status: "planned",
    techStack: ["React", "Node.js", "PostgreSQL", "Socket.io"],
    repoUrl: "https://github.com",
    images: [],
    markdownFiles: [],
    featured: true,
    createdAt: "2025-11-10T10:00:00.000Z",
    updatedAt: "2026-02-20T14:30:00.000Z",
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    slug: "weather-dash",
    title: "WeatherDash",
    description:
      "Painel que consome APIs de clima para exibir previsões de 7 dias, alertas meteorológicos e mapas de temperatura. Interface responsiva com gráficos animados.",
    contentMarkdown:
      "Painel que consome APIs de clima para exibir previsões de 7 dias, alertas meteorológicos e mapas de temperatura. Interface responsiva com gráficos animados.",
    status: "planned",
    techStack: ["Next.js", "TypeScript"],
    repoUrl: "https://github.com",
    images: [],
    markdownFiles: [],
    featured: true,
    createdAt: "2025-09-05T08:00:00.000Z",
    updatedAt: "2026-01-15T09:00:00.000Z",
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    slug: "devlog-api",
    title: "DevLog API",
    description:
      "Backend tipado com autenticação JWT, CRUD de posts técnicos e suporte a markdown. Pensado como motor de um blog de engenharia.",
    contentMarkdown:
      "Backend tipado com autenticação JWT, CRUD de posts técnicos e suporte a markdown. Pensado como motor de um blog de engenharia.",
    status: "wip",
    techStack: ["Express", "TypeScript", "Supabase", "Zod"],
    repoUrl: "https://github.com",
    images: [],
    markdownFiles: [],
    featured: false,
    createdAt: "2026-01-20T12:00:00.000Z",
    updatedAt: "2026-03-01T18:00:00.000Z",
  },
];

export function getMockProjectBySlug(slug: string): Project | undefined {
  return MOCK_PROJECTS.find((p) => p.slug === slug);
}

export function getMockProjectById(id: string): Project | undefined {
  return MOCK_PROJECTS.find((p) => p.id === id);
}

export function getMockFeaturedProjects(): Project[] {
  return MOCK_PROJECTS.filter((p) => p.featured);
}
