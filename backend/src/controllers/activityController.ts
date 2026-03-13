import type { Request, Response } from "express";
import { z } from "zod";
import { AppError, toErrorResponse } from "../lib/errors.js";
import { createActivityForUser, getActivities, getActivityDetail, joinActivityForUser } from "../services/activityService.js";

const ListQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  radius_km: z.coerce.number().positive().max(200).optional()
})
  .refine((value) => (value.latitude === undefined) === (value.longitude === undefined), {
    message: "latitude and longitude must be provided together"
  });

const ParamsSchema = z.object({
  id: z.string().uuid()
});

const CreateActivitySchema = z.object({
  title: z.string().min(1).max(80),
  image_url: z.string().url().optional(),
  location: z.string().min(1).max(120),
  start_time: z.string().datetime(),
  category: z.string().min(1),
  description: z.string().max(1000).optional(),
  max_participants: z.number().int().min(2).max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
});

export async function handleGetActivities(req: Request, res: Response) {
  try {
    if (!req.auth) {
      throw new AppError(401, "UNAUTHORIZED", "Missing bearer token");
    }
    const filters = ListQuerySchema.parse(req.query);
    const data = await getActivities(filters, req.auth.userId, req.auth.email);
    res.status(200).json({
      code: "OK",
      message: "Activities fetched",
      data
    });
  } catch (error) {
    const payload = toErrorResponse(error);
    res.status(payload.status).json(payload.body);
  }
}

export async function handleGetActivityById(req: Request, res: Response) {
  try {
    if (!req.auth) {
      throw new AppError(401, "UNAUTHORIZED", "Missing bearer token");
    }
    const params = ParamsSchema.parse(req.params);
    const data = await getActivityDetail(params.id);
    res.status(200).json({
      code: "OK",
      message: "Activity fetched",
      data
    });
  } catch (error) {
    const payload = toErrorResponse(error);
    res.status(payload.status).json(payload.body);
  }
}

export async function handleCreateActivity(req: Request, res: Response) {
  try {
    if (!req.auth) {
      throw new AppError(401, "UNAUTHORIZED", "Missing bearer token");
    }
    const payload = CreateActivitySchema.parse(req.body);
    const data = await createActivityForUser(req.auth.userId, payload, req.auth.email);
    res.status(201).json({
      code: "CREATED",
      message: "Activity created",
      data
    });
  } catch (error) {
    const payload = toErrorResponse(error);
    res.status(payload.status).json(payload.body);
  }
}

export async function handleJoinActivity(req: Request, res: Response) {
  try {
    if (!req.auth) {
      throw new AppError(401, "UNAUTHORIZED", "Missing bearer token");
    }
    const params = ParamsSchema.parse(req.params);
    const data = await joinActivityForUser(req.auth.userId, params.id, req.auth.email);
    res.status(200).json({
      code: "OK",
      message: "Activity joined",
      data
    });
  } catch (error) {
    const payload = toErrorResponse(error);
    res.status(payload.status).json(payload.body);
  }
}
