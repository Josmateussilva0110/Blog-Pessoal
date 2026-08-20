import { Router } from "express"
const router = Router()

import userRoutes from "./userRoutes"
import projectRoutes from "./projectRoutes"
import siteLinkRoutes from "./siteLinkRoutes"
import siteSettingsRoutes from "./siteSettingsRoutes"

router.use(userRoutes)
router.use("/projects", projectRoutes)
router.use("/site-links", siteLinkRoutes)
router.use("/site-settings", siteSettingsRoutes)

export default router
