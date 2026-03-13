import { Router } from "express";
import {
  handleCreateDirectConversation,
  handleGetConversationMessages,
  handleGetConversations,
  handleGetNotifications,
  handleMarkConversationRead,
  handleSendConversationMessage
} from "../controllers/chatController.js";

export const chatRoutes = Router();

chatRoutes.get("/conversations", handleGetConversations);
chatRoutes.post("/conversations/direct", handleCreateDirectConversation);
chatRoutes.get("/notifications", handleGetNotifications);
chatRoutes.get("/conversations/:id/messages", handleGetConversationMessages);
chatRoutes.post("/conversations/:id/messages", handleSendConversationMessage);
chatRoutes.post("/conversations/:id/read", handleMarkConversationRead);
