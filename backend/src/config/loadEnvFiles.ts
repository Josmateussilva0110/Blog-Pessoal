import path from "path"
import { config } from "dotenv"

const backendRoot = path.resolve(__dirname, "../..")
const monorepoRoot = path.resolve(backendRoot, "..")

/** Carrega o .env da raiz do monorepo e depois o de backend/ (usado pela API e pelos scripts) */
export function loadEnvFiles({ quiet = false }: { quiet?: boolean } = {}) {
    config({ path: path.join(monorepoRoot, ".env"), quiet })
    config({ path: path.join(backendRoot, ".env"), quiet })
}
