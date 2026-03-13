import { Router } from "express";
import {
  handleGetOrCreateDirectConversation,
  handleListConversations,
  handleListMessages,
  handleSendMessage
} from "../controllers/chatController.js";
import { requireAuth } from "../middleware/auth.js";

export const chatRoutes = Router();

chatRoutes.use(requireAuth);

chatRoutes.get("/conversations", handleListConversations);
chatRoutes.post("/conversations/direct/:friendProfileId", handleGetOrCreateDirectConversation);
chatRoutes.get("/conversations/:id/messages", handleListMessages);
chatRoutes.post("/conversations/:id/messages", handleSendMessage);
