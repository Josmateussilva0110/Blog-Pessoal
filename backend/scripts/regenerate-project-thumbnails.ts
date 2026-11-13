/**
 * Regenera as miniaturas das imagens de projeto (.thumb.webp e .thumb.<largura>.webp,
 * uma por largura em PROJECT_THUMB_WIDTHS) a partir das imagens principais,
 * usando o mesmo processamento do upload (imageProcessing.ts).
 *
 * Ordem: rode o script, depois incremente PROJECT_THUMB_VERSION (packages/shared)
 * e publique o front, para a URL nova nunca ser cacheada com a miniatura antiga.
 *
 * Uso:
 *   npm run regenerate-thumbnails -- --dry-run   # só lista o que seria feito
 *   npm run regenerate-thumbnails
 *
 * Requer SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env (raiz ou backend/).
 */
import {
  openProjectImage,
  processProjectThumbnails,
  PROJECT_THUMB_WEBP_QUALITY,
  PROJECT_THUMB_WIDTHS,
  toThumbnailStoragePath,
} from "../src/utils/image/imageProcessing";
// Constante pura: projectStorage.ts importaria o client da API, que exige o .env completo
import { PROJECT_IMAGES_BUCKET } from "../src/constants/storage";
import { supabaseAdmin } from "./lib/supabaseAdmin";

const dryRun = process.argv.includes("--dry-run");
const storage = supabaseAdmin.storage.from(PROJECT_IMAGES_BUCKET);

/** Lista os nomes de um "diretório" do bucket (pastas vêm com id null) */
async function listEntries(prefix: string) {
  const entries: { name: string; isFolder: boolean }[] = [];

  for (let offset = 0; ; offset += 100) {
    const { data, error } = await storage.list(prefix, { limit: 100, offset });
    if (error) throw error;
    entries.push(...data.map((item) => ({ name: item.name, isFolder: item.id === null })));
    if (data.length < 100) return entries;
  }
}

async function findMainImages() {
  const paths: string[] = [];

  for (const project of await listEntries("")) {
    if (!project.isFolder) continue;

    const imagesDir = `${project.name}/images`;
    for (const file of await listEntries(imagesDir)) {
      if (!file.isFolder && !file.name.includes(".thumb.")) {
        paths.push(`${imagesDir}/${file.name}`);
      }
    }
  }

  return paths;
}

async function regenerate(mainPath: string) {
  const { data, error } = await storage.download(mainPath);
  if (error) throw error;

  const thumbs = await processProjectThumbnails(openProjectImage(Buffer.from(await data.arrayBuffer())));

  const results: string[] = [];
  for (const thumb of thumbs) {
    const thumbPath = toThumbnailStoragePath(mainPath, thumb.width);
    // Cache longo: a URL do front muda a cada PROJECT_THUMB_VERSION
    const { error: uploadError } = await storage.upload(thumbPath, thumb.buffer, {
      contentType: "image/webp",
      upsert: true,
      cacheControl: "31536000",
    });
    if (uploadError) throw uploadError;
    results.push(`${thumb.width}px ${Math.round(thumb.buffer.length / 1024)} KB`);
  }

  return { thumbPath: toThumbnailStoragePath(mainPath), summary: results.join(", ") };
}

async function main() {
  const images = await findMainImages();
  console.log(
    `${images.length} imagens encontradas · miniaturas ${PROJECT_THUMB_WIDTHS.join("/")}px q${PROJECT_THUMB_WEBP_QUALITY}` +
      (dryRun ? " · dry-run" : ""),
  );

  let failures = 0;

  for (const mainPath of images) {
    if (dryRun) {
      console.log(
        `  ${mainPath} → ${PROJECT_THUMB_WIDTHS.map((width) => toThumbnailStoragePath(mainPath, width)).join(", ")}`,
      );
      continue;
    }

    try {
      const { thumbPath, summary } = await regenerate(mainPath);
      console.log(`  ✓ ${thumbPath} (${summary})`);
    } catch (error) {
      failures += 1;
      console.error(`  ✗ ${mainPath}:`, error instanceof Error ? error.message : error);
    }
  }

  if (failures > 0) {
    console.error(`${failures} falha(s)`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
