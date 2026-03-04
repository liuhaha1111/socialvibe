import type { Request, Response } from "express";
import { z } from "zod";
import { toErrorResponse } from "../lib/errors.js";
import { getActivities, getActivityDetail } from "../services/activityService.js";

const ListQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional()
});

const ParamsSchema = z.object({
  id: z.string().uuid()
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
