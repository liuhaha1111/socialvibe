import type { Request, Response } from "express";
import { z } from "zod";
import { toErrorResponse } from "../lib/errors.js";
import {
  createDirectConversationForCurrentProfile,
  listConversationMessagesForCurrentProfile,
  listNotificationsForCurrentProfile,
  markConversationReadForCurrentProfile,
  sendMessageForCurrentProfile,
  getMyConversations
} from "../services/chatService.js";

const ConversationParamsSchema = z.object({
  id: z.string().uuid()
});

const DirectConversationBodySchema = z.object({
  partner_profile_id: z.string().uuid()
});

const MessageListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  cursor: z.string().datetime().optional()
});

const SendMessageBodySchema = z.object({
  content: z.string().min(1).max(2000)
});

const ReadBodySchema = z.object({
  last_read_message_id: z.string().uuid().optional()
});

export async function handleGetConversations(_req: Request, res: Response) {
  try {
    const data = await getMyConversations();
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

export async function handleCreateDirectConversation(req: Request, res: Response) {
  try {
    const body = DirectConversationBodySchema.parse(req.body);
    const result = await createDirectConversationForCurrentProfile(body.partner_profile_id);
    res.status(result.created ? 201 : 200).json({
      code: result.created ? "CREATED" : "OK",
      message: result.created ? "Direct conversation created" : "Direct conversation already exists",
      data: result.conversation
    });
  } catch (error) {
    const payload = toErrorResponse(error);
    res.status(payload.status).json(payload.body);
  }
}

export async function handleGetNotifications(_req: Request, res: Response) {
  try {
    const data = await listNotificationsForCurrentProfile();
    res.status(200).json({
      code: "OK",
      message: "Notifications fetched",
      data
    });
  } catch (error) {
    const payload = toErrorResponse(error);
    res.status(payload.status).json(payload.body);
  }
}

export async function handleGetConversationMessages(req: Request, res: Response) {
  try {
    const params = ConversationParamsSchema.parse(req.params);
    const query = MessageListQuerySchema.parse(req.query);
    const data = await listConversationMessagesForCurrentProfile({
      conversationId: params.id,
      limit: query.limit ?? 30,
      cursor: query.cursor
    });
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

export async function handleSendConversationMessage(req: Request, res: Response) {
  try {
    const params = ConversationParamsSchema.parse(req.params);
    const body = SendMessageBodySchema.parse(req.body);
    const data = await sendMessageForCurrentProfile({
      conversationId: params.id,
      content: body.content
    });
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

export async function handleMarkConversationRead(req: Request, res: Response) {
  try {
    const params = ConversationParamsSchema.parse(req.params);
    const body = ReadBodySchema.parse(req.body ?? {});
    const data = await markConversationReadForCurrentProfile({
      conversationId: params.id,
      lastReadMessageId: body.last_read_message_id
    });
    res.status(200).json({
      code: "OK",
      message: "Conversation read state updated",
      data
    });
  } catch (error) {
    const payload = toErrorResponse(error);
    res.status(payload.status).json(payload.body);
  }
}
