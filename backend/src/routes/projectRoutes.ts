import { Router } from "express"
import ProjectController from "../controllers/projectController"
import { authMiddleware } from "../middleware/auth"
import { rejectIfMustChangePassword } from "../middleware/rejectIfMustChangePassword"
import { validate } from "../middleware/validate"
import { handleProjectUpload } from "../middleware/uploadProjectFiles"
import {
  projectIdParamSchema,
  projectSlugParamSchema,
} from "../schemas/projectSchema"

const router = Router()

router.get("/", ProjectController.list)
router.get("/featured", ProjectController.listFeatured)
router.get("/admin", authMiddleware, ProjectController.listAll)
router.get(
  "/id/:id",
  authMiddleware,
  validate(projectIdParamSchema, "params"),
  ProjectController.getById
)
router.get("/:slug", validate(projectSlugParamSchema, "params"), ProjectController.getBySlug)

router.post(
  "/",
  authMiddleware,
  rejectIfMustChangePassword,
  handleProjectUpload,
  ProjectController.create
)

router.put(
  "/:id",
  authMiddleware,
  rejectIfMustChangePassword,
  validate(projectIdParamSchema, "params"),
  handleProjectUpload,
  ProjectController.update
)

router.delete(
  "/:id",
  authMiddleware,
  rejectIfMustChangePassword,
  validate(projectIdParamSchema, "params"),
  ProjectController.remove
)

export default router
