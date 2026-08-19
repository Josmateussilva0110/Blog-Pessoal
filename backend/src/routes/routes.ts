import { Router } from "express"
const router = Router()

import userRoutes from "./userRoutes"
import projectRoutes from "./projectRoutes"

router.use(userRoutes)
router.use("/projects", projectRoutes)

export default router
