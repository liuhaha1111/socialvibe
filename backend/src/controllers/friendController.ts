import type { Request, Response } from "express";
import { z } from "zod";
import { AppError, toErrorResponse } from "../lib/errors.js";
import { discoverProfiles, listFriendRequests, listFriends, respondFriendRequest, sendFriendRequest } from "../services/friendService.js";

const TargetParamsSchema = z.object({
  targetProfileId: z.string().uuid()
});

const RequestParamsSchema = z.object({
  id: z.string().uuid()
});

const QuerySchema = z.object({
  q: z.string().optional()
});

function requireAuth(req: Request): { userId: string; email?: string } {
  if (!req.auth) {
    throw new AppError(401, "UNAUTHORIZED", "Missing bearer token");
  }
  return req.auth;
}

export async function handleSendFriendRequest(req: Request, res: Response) {
  try {
    const auth = requireAuth(req);
    const params = TargetParamsSchema.parse(req.params);
    const data = await sendFriendRequest(auth.userId, params.targetProfileId, auth.email);
    res.status(201).json({
      code: "CREATED",
      message: "Friend request sent",
      data
    });
  } catch (error) {
    const payload = toErrorResponse(error);
    res.status(payload.status).json(payload.body);
  }
}

export async function handleListFriendRequests(req: Request, res: Response) {
  try {
    const auth = requireAuth(req);
    const data = await listFriendRequests(auth.userId, auth.email);
    res.status(200).json({
      code: "OK",
      message: "Friend requests fetched",
      data
    });
  } catch (error) {
    const payload = toErrorResponse(error);
    res.status(payload.status).json(payload.body);
  }
}

export async function handleAcceptFriendRequest(req: Request, res: Response) {
  try {
    const auth = requireAuth(req);
    const params = RequestParamsSchema.parse(req.params);
    const data = await respondFriendRequest(auth.userId, params.id, "accepted", auth.email);
    res.status(200).json({
      code: "OK",
      message: "Friend request accepted",
      data
    });
  } catch (error) {
    const payload = toErrorResponse(error);
    res.status(payload.status).json(payload.body);
  }
}

export async function handleRejectFriendRequest(req: Request, res: Response) {
  try {
    const auth = requireAuth(req);
    const params = RequestParamsSchema.parse(req.params);
    const data = await respondFriendRequest(auth.userId, params.id, "rejected", auth.email);
    res.status(200).json({
      code: "OK",
      message: "Friend request rejected",
      data
    });
  } catch (error) {
    const payload = toErrorResponse(error);
    res.status(payload.status).json(payload.body);
  }
}

export async function handleListFriends(req: Request, res: Response) {
  try {
    const auth = requireAuth(req);
    const data = await listFriends(auth.userId, auth.email);
    res.status(200).json({
      code: "OK",
      message: "Friends fetched",
      data
    });
  } catch (error) {
    const payload = toErrorResponse(error);
    res.status(payload.status).json(payload.body);
  }
}

export async function handleDiscoverProfiles(req: Request, res: Response) {
  try {
    const auth = requireAuth(req);
    const query = QuerySchema.parse(req.query);
    const data = await discoverProfiles(auth.userId, auth.email, query.q);
    res.status(200).json({
      code: "OK",
      message: "Profiles fetched",
      data
    });
  } catch (error) {
    const payload = toErrorResponse(error);
    res.status(payload.status).json(payload.body);
  }
}
