import { Router } from "express";

import { UserController } from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validate-request";
import { asyncHandler } from "../utils/async-handler";
import { searchUsersSchema } from "../validators/user.validator";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(UserController.getUsers));
router.get("/search", validateRequest(searchUsersSchema), asyncHandler(UserController.searchUsers));

export default router;
