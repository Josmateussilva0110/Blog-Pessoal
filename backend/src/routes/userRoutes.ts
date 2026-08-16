import { Router } from "express"
import UserController from "../controllers/userController"
import { validate } from "../middleware/validate"
import { LoginSchema } from "../schemas/loginSchema"
import { UpdateProfileSchema } from "../schemas/updateProfileSchema"
import { PasswordResetRequestSchema } from "../schemas/passwordResetRequestSchema"
import { loginRateLimiter } from "../middleware/loginRateLimit"
import { refreshRateLimiter } from "../middleware/refreshRateLimit"
import { changePasswordRateLimiter } from "../middleware/changePasswordRateLimit"
import { authMiddleware } from "../middleware/auth"
import { validateChangePassword } from "../middleware/validateChangePassword"
import { rejectIfMustChangePassword } from "../middleware/rejectIfMustChangePassword"
import { uploadProfileImage } from "../middleware/uploadProfileImage"


const router = Router()


router.post("/login", loginRateLimiter, validate(LoginSchema), UserController.login)
router.post(
  "/auth/password-reset-request",
  loginRateLimiter,
  validate(PasswordResetRequestSchema),
  UserController.requestPasswordReset
)
router.get("/profile", authMiddleware, UserController.getProfile)
router.put(
  "/profile",
  authMiddleware,
  rejectIfMustChangePassword,
  validate(UpdateProfileSchema),
  UserController.updateProfile
)
router.put(
  "/profile/password",
  authMiddleware,
  changePasswordRateLimiter,
  validateChangePassword,
  UserController.changePassword
)
router.put(
  "/profile/image",
  authMiddleware,
  rejectIfMustChangePassword,
  uploadProfileImage,
  UserController.uploadProfileImage
)
router.delete(
  "/profile/image",
  authMiddleware,
  rejectIfMustChangePassword,
  UserController.deleteProfileImage
)
router.get("/public/profile-image/meta", UserController.getPublicProfileImageMeta)
router.get("/public/profile-image", UserController.getPublicProfileImage)
router.post("/logout", UserController.logout)
router.post("/auth/refresh", refreshRateLimiter, UserController.refresh.bind(UserController))


export default router
