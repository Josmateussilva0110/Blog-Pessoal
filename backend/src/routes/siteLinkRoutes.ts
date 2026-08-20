import { Router } from "express"
import SiteLinkController from "../controllers/siteLinkController"
import { authMiddleware } from "../middleware/auth"
import { rejectIfMustChangePassword } from "../middleware/rejectIfMustChangePassword"
import { validate } from "../middleware/validate"
import { updateSiteLinksSchema } from "../schemas/siteLinkSchema"

const router = Router()

router.get("/", SiteLinkController.list)
router.put(
  "/",
  authMiddleware,
  rejectIfMustChangePassword,
  validate(updateSiteLinksSchema),
  SiteLinkController.replaceAll
)

export default router
