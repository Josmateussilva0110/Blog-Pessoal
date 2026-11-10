import { Router } from "express"
import projectRoutes from "./projectRoutes"
import siteLinkRoutes from "./siteLinkRoutes"
import siteSettingsRoutes from "./siteSettingsRoutes"
import userRoutes from "./userRoutes"

const router = Router()

router.use(userRoutes)
router.use("/projects", projectRoutes)
router.use("/site-links", siteLinkRoutes)
router.use("/site-settings", siteSettingsRoutes)

export default router
