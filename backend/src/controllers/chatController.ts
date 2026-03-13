import type { Request, Response } from "express";
import { z } from "zod";
import { AppError, toErrorResponse } from "../lib/errors.js";
import {
  getConversationMessagesForAuthUser,
  getOrCreateDirectConversationForAuthUser,
  listConversationsForAuthUser,
  sendMessageForAuthUser
} from "../services/chatService.js";

const DirectParamsSchema = z.object({
  friendProfileId: z.string().uuid()
});

const ConversationParamsSchema = z.object({
  id: z.string().uuid()
});

const SendMessageBodySchema = z.object({
  content: z.string().min(1).max(2000)
});

function requireAuth(req: Request): { userId: string; email?: string } {
  if (!req.auth) {
    throw new AppError(401, "UNAUTHORIZED", "Missing bearer token");
  }
  return req.auth;
}

export async function handleListConversations(req: Request, res: Response) {
  try {
    const auth = requireAuth(req);
    const data = await listConversationsForAuthUser(auth.userId, auth.email);
    res.status(200).json({
      code: "OK",
      message: "Conversations fetched",
      data
    });
  } catch (error) {
    const payload = toErrorResponse(error);
    res.status(payload.status).json(payload.body);
  }
}

export async function handleGetOrCreateDirectConversation(req: Request, res: Response) {
  try {
    const auth = requireAuth(req);
    const params = DirectParamsSchema.parse(req.params);
    const data = await getOrCreateDirectConversationForAuthUser(auth.userId, params.friendProfileId, auth.email);
    res.status(200).json({
      code: "OK",
      message: "Direct conversation ready",
      data
    });
  } catch (error) {
    const payload = toErrorResponse(error);
    res.status(payload.status).json(payload.body);
  }
}

export async function handleListMessages(req: Request, res: Response) {
  try {
    const auth = requireAuth(req);
    const params = ConversationParamsSchema.parse(req.params);
    const data = await getConversationMessagesForAuthUser(auth.userId, params.id, auth.email);
    res.status(200).json({
      code: "OK",
      message: "Messages fetched",
      data
    });
  } catch (error) {
    const payload = toErrorResponse(error);
    res.status(payload.status).json(payload.body);
  }
}

export async function handleSendMessage(req: Request, res: Response) {
  try {
    const auth = requireAuth(req);
    const params = ConversationParamsSchema.parse(req.params);
    const body = SendMessageBodySchema.parse(req.body);
    const data = await sendMessageForAuthUser(auth.userId, params.id, body.content, auth.email);
    res.status(201).json({
      code: "CREATED",
      message: "Message sent",
      data
    });
  } catch (error) {
    const payload = toErrorResponse(error);
    res.status(payload.status).json(payload.body);
  }
}
