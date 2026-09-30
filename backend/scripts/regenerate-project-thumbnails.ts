/**
 * Regenera as miniaturas (.thumb.webp) das imagens de projeto a partir das
 * imagens principais, usando as configurações atuais de imageProcessing.ts.
 *
 * Uso:
 *   npm run regenerate-thumbnails -- --dry-run   # só lista o que seria feito
 *   npm run regenerate-thumbnails
 *
 * Requer SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env (raiz ou backend/).
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import path from "path";
import sharp from "sharp";
import {
  PROJECT_THUMB_MAX_WIDTH,
  PROJECT_THUMB_WEBP_QUALITY,
  toThumbnailStoragePath,
} from "../src/utils/image/imageProcessing";

const BUCKET = "project-images";

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

const dryRun = process.argv.includes("--dry-run");
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});
const storage = supabase.storage.from(BUCKET);

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
  const thumbPath = toThumbnailStoragePath(mainPath);

  const { data, error } = await storage.download(mainPath);
  if (error) throw error;

  const thumb = await sharp(Buffer.from(await data.arrayBuffer()))
    .resize({ width: PROJECT_THUMB_MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: PROJECT_THUMB_WEBP_QUALITY })
    .toBuffer();

  const { error: uploadError } = await storage.upload(thumbPath, thumb, {
    contentType: "image/webp",
    upsert: true,
  });
  if (uploadError) throw uploadError;

  return { thumbPath, kb: Math.round(thumb.length / 1024) };
}

async function main() {
  const images = await findMainImages();
  console.log(
    `${images.length} imagens encontradas · miniatura ${PROJECT_THUMB_MAX_WIDTH}px q${PROJECT_THUMB_WEBP_QUALITY}` +
      (dryRun ? " · dry-run" : ""),
  );

  let failures = 0;

  for (const mainPath of images) {
    if (dryRun) {
      console.log(`  ${mainPath} → ${toThumbnailStoragePath(mainPath)}`);
      continue;
    }

    try {
      const { thumbPath, kb } = await regenerate(mainPath);
      console.log(`  ✓ ${thumbPath} (${kb} KB)`);
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
