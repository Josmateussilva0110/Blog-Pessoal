import { Router } from "express"
const router = Router()

import userRoutes from "./userRoutes"
import projectRoutes from "./projectRoutes"
import siteLinkRoutes from "./siteLinkRoutes"

router.use(userRoutes)
router.use("/projects", projectRoutes)
router.use("/site-links", siteLinkRoutes)

export default router
