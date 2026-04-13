import { Router } from "express";

import { ConversationController } from "../controllers/conversation.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validate-request";
import { asyncHandler } from "../utils/async-handler";
import { accessConversationSchema } from "../validators/conversation.validator";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(ConversationController.getConversations));
router.post(
  "/access",
  validateRequest(accessConversationSchema),
  asyncHandler(ConversationController.accessConversation)
);

export default router;
