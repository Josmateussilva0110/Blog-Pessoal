import { Router } from "express"
import SiteSettingsController from "../controllers/siteSettingsController"
import { authMiddleware } from "../middleware/auth"
import { rejectIfMustChangePassword } from "../middleware/rejectIfMustChangePassword"
import { validate } from "../middleware/validate"
import { UpdateHeroStatsSchema } from "../schemas/siteSettings/heroStats"

const router = Router()

router.get("/hero-stats", SiteSettingsController.getHeroStats)
router.put(
  "/hero-stats",
  authMiddleware,
  rejectIfMustChangePassword,
  validate({ body: UpdateHeroStatsSchema }),
  SiteSettingsController.updateHeroStats
)

export default router
