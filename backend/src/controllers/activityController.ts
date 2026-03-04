import type { Request, Response } from "express";
import { z } from "zod";
import { toErrorResponse } from "../lib/errors.js";
import { createActivityForTestProfile, getActivities, getActivityDetail } from "../services/activityService.js";

const ListQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional()
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
  max_participants: z.number().int().min(2).max(100)
});

export async function handleGetActivities(req: Request, res: Response) {
  try {
    const filters = ListQuerySchema.parse(req.query);
    const data = await getActivities(filters);
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
    const payload = CreateActivitySchema.parse(req.body);
    const data = await createActivityForTestProfile(payload);
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
