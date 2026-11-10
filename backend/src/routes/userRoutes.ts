import { Router } from "express"
import UserController from "../controllers/userController"
import { authMiddleware } from "../middleware/auth"
import { changePasswordRateLimiter } from "../middleware/changePasswordRateLimit"
import { loginRateLimiter } from "../middleware/loginRateLimit"
import { refreshRateLimiter } from "../middleware/refreshRateLimit"
import { rejectIfMustChangePassword } from "../middleware/rejectIfMustChangePassword"
import { uploadProfileImage } from "../middleware/uploadProfileImage"
import { validate } from "../middleware/validate"
import { ChangePasswordSchema } from "../schemas/auth/changePassword"
import { LoginSchema } from "../schemas/auth/login"
import { PasswordResetRequestSchema } from "../schemas/auth/passwordResetRequest"
import { UpdateProfileSchema } from "../schemas/users/updateProfile"

const router = Router()

// Ordem: rate limit -> auth -> validate -> controller (da checagem mais barata para a mais cara)
router.post("/login", loginRateLimiter, validate({ body: LoginSchema }), UserController.login)
router.post(
  "/auth/password-reset-request",
  loginRateLimiter,
  validate({ body: PasswordResetRequestSchema }),
  UserController.requestPasswordReset
)
router.post("/auth/refresh", refreshRateLimiter, UserController.refresh)
router.post("/logout", UserController.logout)

router.get("/profile", authMiddleware, UserController.getProfile)
router.put(
  "/profile",
  authMiddleware,
  rejectIfMustChangePassword,
  validate({ body: UpdateProfileSchema }),
  UserController.updateProfile
)
router.put(
  "/profile/password",
  changePasswordRateLimiter,
  authMiddleware,
  validate({ body: ChangePasswordSchema }),
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

export default router
