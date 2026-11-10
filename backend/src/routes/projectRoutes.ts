import express, { Router } from "express"
import { PROJECT_UPDATE_BODY_LIMIT } from "../constants/http"
import ProjectController from "../controllers/projectController"
import ProjectUpdateController from "../controllers/projectUpdateController"
import { authMiddleware } from "../middleware/auth"
import { parseJsonField } from "../middleware/parseJsonField"
import { rejectIfMustChangePassword } from "../middleware/rejectIfMustChangePassword"
import { uploadProjectFiles } from "../middleware/uploadProjectFiles"
import { validate } from "../middleware/validate"
import { IdParamSchema } from "../schemas/common/idParam"
import { PaginationQuerySchema } from "../schemas/common/pagination"
import { ProjectPayloadSchema, ProjectSlugParamSchema } from "../schemas/projects/project"
import { ProjectUpdateParamSchema, ProjectUpdatePayloadSchema } from "../schemas/projectUpdates/projectUpdate"

const router = Router()

// Atualizações (changelog) levam markdown: o corpo só é lido depois da autenticação
// (o parser global de 10kb ignora estas rotas, ver app.ts)
const parseProjectUpdateBody = express.json({ limit: PROJECT_UPDATE_BODY_LIMIT })

const adminOnly = [authMiddleware, rejectIfMustChangePassword]

router.get("/", validate({ query: PaginationQuerySchema }), ProjectController.list)
router.get("/home", ProjectController.listHome)
router.get("/featured", validate({ query: PaginationQuerySchema }), ProjectController.listFeatured)
router.get("/count", ProjectController.count)
router.get("/admin", authMiddleware, validate({ query: PaginationQuerySchema }), ProjectController.listAdmin)
router.get("/id/:id", authMiddleware, validate({ params: IdParamSchema }), ProjectController.getById)
router.get(
  "/id/:id/updates",
  authMiddleware,
  validate({ params: IdParamSchema, query: PaginationQuerySchema }),
  ProjectUpdateController.list
)
router.get("/:slug", validate({ params: ProjectSlugParamSchema }), ProjectController.getBySlug)

// Multipart: o multer lê o corpo, o JSON do campo "data" vira o body e só então é validado
router.post(
  "/",
  ...adminOnly,
  uploadProjectFiles,
  parseJsonField("data"),
  validate({ body: ProjectPayloadSchema }),
  ProjectController.create
)
router.put(
  "/:id",
  ...adminOnly,
  validate({ params: IdParamSchema }),
  uploadProjectFiles,
  parseJsonField("data"),
  validate({ body: ProjectPayloadSchema }),
  ProjectController.update
)
router.delete("/:id", ...adminOnly, validate({ params: IdParamSchema }), ProjectController.remove)

router.post(
  "/:id/updates",
  ...adminOnly,
  validate({ params: IdParamSchema }),
  parseProjectUpdateBody,
  validate({ body: ProjectUpdatePayloadSchema }),
  ProjectUpdateController.create
)
router.put(
  "/:id/updates/:updateId",
  ...adminOnly,
  validate({ params: ProjectUpdateParamSchema }),
  parseProjectUpdateBody,
  validate({ body: ProjectUpdatePayloadSchema }),
  ProjectUpdateController.update
)
router.delete(
  "/:id/updates/:updateId",
  ...adminOnly,
  validate({ params: ProjectUpdateParamSchema }),
  ProjectUpdateController.remove
)

export default router
