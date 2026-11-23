/**
 * Agente de publicação do blog: cria projetos e publica atualizações pela API,
 * autenticado pela AGENT_API_KEY (nunca pela senha do admin).
 *
 * Uso:
 *   npm run agent -- draft <owner/repo> [saida.md]    gera rascunho de projeto a partir do GitHub
 *   npm run agent -- draft-update <owner/repo> [saida.md] [--since <tag|sha|AAAA-MM-DD>]
 *                                                      gera rascunho de atualização a partir dos commits
 *   npm run agent -- project <arquivo.md> [--dry-run] cria um projeto
 *   npm run agent -- update <slug> <arquivo.md> [--dry-run]   publica atualização num projeto
 *
 * Variáveis (.env da raiz ou de backend/):
 *   BLOG_API_URL    ex.: https://minha-api.onrender.com  (sem /api no final)
 *   AGENT_API_KEY   a mesma chave configurada no backend
 *   GITHUB_TOKEN    opcional, só para os "draft" (repositórios privados / limite da API)
 *
 * No draft-update, sem --since, entram os commits desde a última release (ou tag).
 * Commits no padrão "feat:", "fix:", "perf:" e "refactor:" viram seções; chore, docs,
 * test, ci, build, style e merges ficam de fora; o resto vai para "Outras mudanças".
 *
 * Formato do arquivo .md: frontmatter entre "---" e, depois, o corpo em markdown.
 *
 *   Projeto:                         Atualização:
 *   ---                              ---
 *   title: Meu App                   title: Login com Google
 *   slug: meu-app                    version: 1.2.0            (opcional)
 *   description: Resumo curto        publishedAt: 2026-11-22   (opcional, padrão: agora)
 *   status: wip                      ---
 *   platform: mobile                 Texto da atualização em markdown...
 *   techStack: [React Native, Expo]
 *   repoUrl: https://github.com/...
 *   featured: false
 *   images: [./prints/home.png]      (caminhos locais, opcional)
 *   ---
 *   Conteúdo do projeto em markdown...
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { basename, dirname, extname, resolve } from "node:path"
import { config as loadDotenv } from "dotenv"
import {
  CSRF_HEADER_NAME,
  CSRF_HEADER_VALUE,
  PROJECT_DESCRIPTION_MAX_LENGTH,
  projectFormSchema,
  projectUpdateFormSchema,
} from "@blog/shared"

for (const file of [resolve(__dirname, "../../.env"), resolve(__dirname, "../.env")]) {
  if (existsSync(file)) loadDotenv({ path: file, quiet: true })
}

const IMAGE_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
}

type Frontmatter = Record<string, string | string[] | boolean>

function fail(message: string): never {
  console.error(`❌ ${message}`)
  process.exit(1)
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) fail(`Defina ${name} no .env`)
  return value
}

// ── Markdown com frontmatter ─────────────────────────────

function parseValue(raw: string): string | string[] | boolean {
  const value = raw.trim()
  if (value === "true") return true
  if (value === "false") return false
  if (value.startsWith("[") && value.endsWith("]")) {
    return value
      .slice(1, -1)
      .split(",")
      .map((item) => unquote(item.trim()))
      .filter(Boolean)
  }
  return unquote(value)
}

function unquote(value: string): string {
  return /^(["']).*\1$/.test(value) ? value.slice(1, -1) : value
}

function parseMarkdownFile(path: string): { meta: Frontmatter; body: string } {
  if (!existsSync(path)) fail(`Arquivo não encontrado: ${path}`)

  const text = readFileSync(path, "utf8").replace(/\r\n/g, "\n")
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(text)
  if (!match) fail(`${path} precisa começar com o frontmatter entre "---"`)

  const meta: Frontmatter = {}
  let listKey: string | null = null

  for (const line of match[1].split("\n")) {
    if (!line.trim() || line.trim().startsWith("#")) continue

    const listItem = /^\s*-\s+(.*)$/.exec(line)
    if (listItem && listKey) {
      ;(meta[listKey] as string[]).push(unquote(listItem[1].trim()))
      continue
    }

    const pair = /^([A-Za-z]+):\s*(.*)$/.exec(line)
    if (!pair) fail(`Linha inválida no frontmatter: "${line}"`)

    const [, key, raw] = pair
    if (raw.trim() === "") {
      meta[key] = []
      listKey = key
    } else {
      meta[key] = parseValue(raw)
      listKey = null
    }
  }

  return { meta, body: match[2].trim() }
}

function asString(meta: Frontmatter, key: string): string | undefined {
  const value = meta[key]
  return typeof value === "string" ? value : undefined
}

function asList(meta: Frontmatter, key: string): string[] {
  const value = meta[key]
  if (Array.isArray(value)) return value
  if (typeof value === "string" && value) return [value]
  return []
}

function printIssues(issues: { path: PropertyKey[]; message: string }[]): never {
  console.error("❌ Dados inválidos:")
  for (const issue of issues) console.error(`  - ${issue.path.join(".") || "(raiz)"}: ${issue.message}`)
  process.exit(1)
}

// ── API ──────────────────────────────────────────────────

interface ApiEnvelope<T> {
  success: boolean
  message: string
  code?: string
  data?: T
  errors?: { field: string; message: string }[]
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const baseUrl = requireEnv("BLOG_API_URL").replace(/\/+$/, "").replace(/\/api$/, "")
  const headers = new Headers(init.headers)
  headers.set(CSRF_HEADER_NAME, CSRF_HEADER_VALUE)
  if (init.method && init.method !== "GET") {
    headers.set("Authorization", `Bearer ${requireEnv("AGENT_API_KEY")}`)
  }

  const response = await fetch(`${baseUrl}/api${path}`, { ...init, headers })
  const body = (await response.json().catch(() => null)) as ApiEnvelope<T> | null

  if (!response.ok || !body?.success) {
    const detail = body?.errors?.map((error) => `\n  - ${error.field}: ${error.message}`).join("") ?? ""
    fail(`API ${response.status} ${body?.code ?? ""}: ${body?.message ?? response.statusText}${detail}`)
  }

  return body.data as T
}

// ── Comandos ─────────────────────────────────────────────

async function createProject(file: string, dryRun: boolean) {
  const { meta, body } = parseMarkdownFile(file)
  const imagePaths = asList(meta, "images").map((image) => resolve(dirname(file), image))

  const parsed = projectFormSchema.safeParse({
    title: asString(meta, "title"),
    slug: asString(meta, "slug"),
    description: asString(meta, "description"),
    contentMarkdown: body,
    status: asString(meta, "status") ?? "completed",
    platform: asString(meta, "platform") ?? "web",
    techStack: asList(meta, "techStack"),
    repoUrl: asString(meta, "repoUrl") ?? "",
    featured: meta.featured === true,
    images: [],
    imageOrder: imagePaths.map((_, index) => ({ pending: index })),
  })
  if (!parsed.success) printIssues(parsed.error.issues)

  const form = new FormData()
  form.append("data", JSON.stringify({ ...parsed.data, repoUrl: parsed.data.repoUrl ?? "" }))

  for (const imagePath of imagePaths) {
    const type = IMAGE_TYPES[extname(imagePath).toLowerCase()]
    if (!type) fail(`Imagem com formato não aceito (use PNG, JPEG, WebP ou GIF): ${imagePath}`)
    if (!existsSync(imagePath)) fail(`Imagem não encontrada: ${imagePath}`)
    form.append("images", new Blob([readFileSync(imagePath)], { type }), basename(imagePath))
  }

  if (dryRun) {
    console.log("🔎 dry-run — nada foi enviado. Projeto válido:")
    console.log({ ...parsed.data, contentMarkdown: `${body.slice(0, 80)}…`, imagens: imagePaths })
    return
  }

  const project = await api<{ id: string; slug: string }>("/projects", { method: "POST", body: form })
  console.log(`✅ Projeto criado: ${project.slug} (${project.id})`)
}

/**
 * Só a data ("2026-11-22") vira meio-dia no fuso local: lida como meia-noite UTC, ela
 * apareceria como o dia anterior no Brasil
 */
function parsePublishedAt(value: string): string {
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value)
  if (Number.isNaN(date.getTime())) fail(`publishedAt inválido: "${value}" (use AAAA-MM-DD)`)
  return date.toISOString()
}

async function createUpdate(slug: string, file: string, dryRun: boolean) {
  const { meta, body } = parseMarkdownFile(file)
  const publishedAt = asString(meta, "publishedAt")

  const parsed = projectUpdateFormSchema.safeParse({
    title: asString(meta, "title"),
    version: asString(meta, "version"),
    contentMarkdown: body,
    publishedAt: publishedAt ? parsePublishedAt(publishedAt) : new Date().toISOString(),
  })
  if (!parsed.success) printIssues(parsed.error.issues)

  if (dryRun) {
    console.log(`🔎 dry-run — nada foi enviado. Atualização válida para "${slug}":`)
    console.log({ ...parsed.data, contentMarkdown: `${body.slice(0, 80)}…` })
    return
  }

  // Rota pública por slug devolve o id do projeto
  const project = await api<{ id: string; title: string }>(`/projects/${encodeURIComponent(slug)}`)
  const update = await api<{ id: string }>(`/projects/${project.id}/updates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  })
  console.log(`✅ Atualização publicada em "${project.title}" (${update.id})`)
}

// ── GitHub ───────────────────────────────────────────────

interface GithubRepo {
  name: string
  description: string | null
  html_url: string
  default_branch: string
  topics?: string[]
}

interface GithubCommit {
  sha: string
  commit: { message: string; author: { date: string } | null }
}

function githubClient(fullName: string) {
  if (!/^[\w.-]+\/[\w.-]+$/.test(fullName)) fail('Use o formato "dono/repositorio"')

  const headers: Record<string, string> = { Accept: "application/vnd.github+json" }
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

  const request = (path: string, accept?: string) =>
    fetch(`https://api.github.com/repos/${fullName}${path}`, {
      headers: accept ? { ...headers, Accept: accept } : headers,
    })

  const github = async (path: string, accept?: string) => {
    const response = await request(path, accept)
    if (!response.ok) fail(`GitHub ${response.status} em ${path || "/"}: ${response.statusText}`)
    return response
  }

  /** Para o que pode não existir (ex.: repositório sem release): 404 vira null */
  const githubOptional = async <T>(path: string): Promise<T | null> => {
    const response = await request(path)
    if (response.status === 404) return null
    if (!response.ok) fail(`GitHub ${response.status} em ${path}: ${response.statusText}`)
    return (await response.json()) as T
  }

  return { github, githubOptional }
}

type GithubClient = ReturnType<typeof githubClient>

const toYamlValue = (value: string) => (/[:#\[\],]/.test(value) ? JSON.stringify(value) : value)

const toSlug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

/** Gera um .md de projeto a partir do repositório no GitHub, para revisar antes de publicar */
async function draftFromRepo(fullName: string, output?: string) {
  const { github } = githubClient(fullName)

  const repo = (await (await github("")).json()) as GithubRepo
  const languages = Object.keys((await (await github("/languages")).json()) as Record<string, number>)
  const readme = await (await github("/readme", "application/vnd.github.raw")).text()

  const slug = toSlug(repo.name)
  const title = repo.name.replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
  const description = (repo.description ?? "TODO: escreva um resumo curto").slice(0, PROJECT_DESCRIPTION_MAX_LENGTH)
  const techStack = [...new Set([...languages, ...(repo.topics ?? [])])]
  const platform = /react[- ]native|expo|android|ios|flutter|kotlin|swift/i.test(`${readme} ${techStack.join(" ")}`)
    ? "mobile"
    : "web"

  const content = [
    "---",
    `title: ${toYamlValue(title)}`,
    `slug: ${slug}`,
    `description: ${toYamlValue(description)}`,
    "status: completed",
    `platform: ${platform}`,
    `techStack: [${techStack.join(", ")}]`,
    `repoUrl: ${repo.html_url}`,
    "featured: false",
    "---",
    "",
    readme.trim(),
    "",
  ].join("\n")

  const target = resolve(output ?? `${slug}.md`)
  writeFileSync(target, content)
  console.log(`📝 Rascunho salvo em ${target}`)
  console.log(`   Revise e publique com: npm run agent -- project ${target}`)
}

// ── Rascunho de atualização a partir dos commits ─────────

const COMMIT_SECTIONS: Record<string, string> = {
  feat: "Novidades",
  fix: "Correções",
  perf: "Desempenho",
  refactor: "Melhorias internas",
}
const IGNORED_COMMIT_TYPES = new Set(["chore", "docs", "test", "ci", "build", "style"])
const OTHER_SECTION = "Outras mudanças"
const MAX_COMMIT_PAGES = 5

/** Base da comparação: o --since informado ou, sem ele, a última release/tag */
async function resolveBaseRef(
  githubOptional: GithubClient["githubOptional"],
  since?: string
): Promise<string | null> {
  if (since) return since

  const release = await githubOptional<{ tag_name: string }>("/releases/latest")
  if (release) return release.tag_name

  const tags = (await githubOptional<{ name: string }[]>("/tags?per_page=100")) ?? []
  const [latest] = tags
    .map((tag) => tag.name)
    .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
  return latest ?? null
}

async function fetchCommits(
  github: GithubClient["github"],
  repo: GithubRepo,
  base: string | null
): Promise<GithubCommit[]> {
  // Data: lista os commits do branch principal a partir dela (a API devolve do mais novo para o mais antigo)
  if (!base || /^\d{4}-\d{2}-\d{2}/.test(base)) {
    const since = base ? `&since=${new Date(base).toISOString()}` : ""
    const commits: GithubCommit[] = []
    for (let page = 1; page <= (base ? MAX_COMMIT_PAGES : 1); page++) {
      const batch = (await (
        await github(`/commits?sha=${encodeURIComponent(repo.default_branch)}&per_page=100&page=${page}${since}`)
      ).json()) as GithubCommit[]
      commits.push(...batch)
      if (batch.length < 100) break
    }
    return commits.reverse()
  }

  // Tag ou sha: compara com o branch principal (já vem do mais antigo para o mais novo)
  const compare = (await (
    await github(`/compare/${encodeURIComponent(base)}...${encodeURIComponent(repo.default_branch)}`)
  ).json()) as { commits: GithubCommit[] }
  return compare.commits
}

/** Agrupa a primeira linha de cada commit pela seção do tipo ("feat: x" vai para Novidades) */
function groupCommits(commits: GithubCommit[]): Map<string, string[]> {
  const sections = new Map<string, string[]>(
    [...Object.values(COMMIT_SECTIONS), OTHER_SECTION].map((section) => [section, []])
  )

  for (const { commit } of commits) {
    const subject = commit.message.split("\n")[0].trim()
    if (!subject || /^merge\b/i.test(subject)) continue

    const conventional = /^(\w+)(?:\([^)]*\))?(!)?:\s*(.+)$/.exec(subject)
    const type = conventional?.[1].toLowerCase()
    if (type && IGNORED_COMMIT_TYPES.has(type)) continue

    const text = conventional ? conventional[3] : subject
    const line = `${text.charAt(0).toUpperCase()}${text.slice(1)}${conventional?.[2] ? " (mudança incompatível)" : ""}`
    const section = (type && COMMIT_SECTIONS[type]) || OTHER_SECTION
    const lines = sections.get(section)!
    if (!lines.includes(line)) lines.push(line)
  }

  for (const [section, lines] of sections) if (!lines.length) sections.delete(section)
  return sections
}

/** Sugere a próxima versão a partir da tag base: feat sobe o minor, o resto sobe o patch */
function suggestVersion(base: string | null, sections: Map<string, string[]>): string | undefined {
  const match = base ? /^(v?)(\d+)\.(\d+)\.(\d+)$/.exec(base) : null
  if (!match) return undefined

  const [major, minor, patch] = match.slice(2).map(Number)
  return sections.has(COMMIT_SECTIONS.feat) ? `${major}.${minor + 1}.0` : `${major}.${minor}.${patch + 1}`
}

/** Gera um .md de atualização com os commits desde a base, para revisar antes de publicar */
async function draftUpdateFromCommits(fullName: string, output?: string, since?: string) {
  const { github, githubOptional } = githubClient(fullName)
  const repo = (await (await github("")).json()) as GithubRepo

  const base = await resolveBaseRef(githubOptional, since)
  const commits = await fetchCommits(github, repo, base)
  const sections = groupCommits(commits)
  if (!sections.size) fail(`Nenhum commit para publicar desde ${base ?? "o início"}`)

  const today = new Date().toISOString().slice(0, 10)
  const version = suggestVersion(base, sections)
  const title = version ? `Versão ${version}` : `Atualização de ${today}`
  const body = [...sections]
    .map(([section, lines]) => [`## ${section}`, "", ...lines.map((line) => `- ${line}`)].join("\n"))
    .join("\n\n")

  const content = [
    "---",
    `# ${commits.length} commit(s) de ${base ?? "início"} até ${repo.default_branch}; revise título, versão e texto`,
    `title: ${toYamlValue(title)}`,
    ...(version ? [`version: ${version}`] : []),
    `publishedAt: ${today}`,
    "---",
    "",
    body,
    "",
  ].join("\n")

  const target = resolve(output ?? `${toSlug(repo.name)}-${version ?? today}.md`)
  writeFileSync(target, content)
  console.log(`📝 Rascunho de atualização salvo em ${target} (${commits.length} commit(s) desde ${base ?? "o início"})`)
  console.log(`   Revise e publique com: npm run agent -- update <slug-do-projeto> ${target}`)
}

/** Tira "--flag valor" dos argumentos e devolve o valor */
function takeOption(args: string[], name: string): string | undefined {
  const index = args.indexOf(name)
  if (index === -1) return undefined

  const value = args[index + 1]
  if (!value || value.startsWith("--")) fail(`Informe um valor para ${name}`)
  args.splice(index, 2)
  return value
}

async function main() {
  const args = process.argv.slice(2)
  const since = takeOption(args, "--since")
  const dryRun = args.includes("--dry-run")
  const [command, ...rest] = args.filter((arg) => arg !== "--dry-run")

  switch (command) {
    case "draft":
      if (!rest[0]) fail("Uso: npm run agent -- draft <owner/repo> [saida.md]")
      return draftFromRepo(rest[0], rest[1])
    case "draft-update":
      if (!rest[0]) fail("Uso: npm run agent -- draft-update <owner/repo> [saida.md] [--since <tag|sha|data>]")
      return draftUpdateFromCommits(rest[0], rest[1], since)
    case "project":
      if (!rest[0]) fail("Uso: npm run agent -- project <arquivo.md> [--dry-run]")
      return createProject(resolve(rest[0]), dryRun)
    case "update":
      if (!rest[0] || !rest[1]) fail("Uso: npm run agent -- update <slug> <arquivo.md> [--dry-run]")
      return createUpdate(rest[0], resolve(rest[1]), dryRun)
    default:
      console.log(readFileSync(__filename, "utf8").split("*/")[0].replace(/^\/\*\*|^ \* ?/gm, ""))
      process.exit(command ? 1 : 0)
  }
}

main().catch((error: unknown) => fail(error instanceof Error ? error.message : String(error)))
