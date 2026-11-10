import { Router } from "express"
import SiteLinkController from "../controllers/siteLinkController"
import { authMiddleware } from "../middleware/auth"
import { rejectIfMustChangePassword } from "../middleware/rejectIfMustChangePassword"
import { validate } from "../middleware/validate"
import { UpdateSiteLinksSchema } from "../schemas/siteLinks/siteLinks"

const router = Router()

router.get("/", SiteLinkController.list)
router.put(
  "/",
  authMiddleware,
  rejectIfMustChangePassword,
  validate({ body: UpdateSiteLinksSchema }),
  SiteLinkController.replaceAll
)

export default router
