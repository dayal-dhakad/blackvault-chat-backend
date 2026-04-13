import { Router } from "express";

import { MessageController } from "../controllers/message.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validate-request";
import { asyncHandler } from "../utils/async-handler";
import { getMessagesSchema, markReadSchema, sendMessageSchema } from "../validators/message.validator";

const router = Router();

router.use(authenticate);

router.get("/:conversationId", validateRequest(getMessagesSchema), asyncHandler(MessageController.getMessages));
router.post("/", validateRequest(sendMessageSchema), asyncHandler(MessageController.sendMessage));
router.patch("/:messageId/read", validateRequest(markReadSchema), asyncHandler(MessageController.markRead));

export default router;
