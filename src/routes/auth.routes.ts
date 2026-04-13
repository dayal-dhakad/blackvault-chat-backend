import { Router } from "express";

import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authRateLimiter } from "../middlewares/rate-limit.middleware";
import { validateRequest } from "../middlewares/validate-request";
import { asyncHandler } from "../utils/async-handler";
import { loginSchema, refreshSchema, registerSchema } from "../validators/auth.validator";

const router = Router();

router.post("/register", authRateLimiter, validateRequest(registerSchema), asyncHandler(AuthController.register));
router.post("/login", authRateLimiter, validateRequest(loginSchema), asyncHandler(AuthController.login));
router.post("/refresh", authRateLimiter, validateRequest(refreshSchema), asyncHandler(AuthController.refresh));
router.post("/logout", authenticate, asyncHandler(AuthController.logout));
router.get("/me", authenticate, asyncHandler(AuthController.me));

export default router;
