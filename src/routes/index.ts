import { Router } from "express";

import authRoutes from "./auth.routes";
import conversationRoutes from "./conversation.routes";
import messageRoutes from "./message.routes";
import userRoutes from "./user.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/conversations", conversationRoutes);
router.use("/messages", messageRoutes);

export default router;
