import type { Request, Response } from "express";
import { z } from "zod";
import { toErrorResponse } from "../lib/errors.js";
import { addFavorite, listMyFavorites, removeFavorite } from "../services/favoriteService.js";

const ParamsSchema = z.object({
  activityId: z.string().uuid()
});

export async function handleGetFavorites(_req: Request, res: Response) {
  try {
    const data = await listMyFavorites();
    res.status(200).json({
      code: "OK",
      message: "Favorites fetched",
      data
    });
  } catch (error) {
    const payload = toErrorResponse(error);
    res.status(payload.status).json(payload.body);
  }
}

export async function handleAddFavorite(req: Request, res: Response) {
  try {
    const params = ParamsSchema.parse(req.params);
    await addFavorite(params.activityId);
    res.status(201).json({
      code: "CREATED",
      message: "Favorite created",
      data: null
    });
  } catch (error) {
    const payload = toErrorResponse(error);
    res.status(payload.status).json(payload.body);
  }
}

export async function handleDeleteFavorite(req: Request, res: Response) {
  try {
    const params = ParamsSchema.parse(req.params);
    await removeFavorite(params.activityId);
    res.status(204).send();
  } catch (error) {
    const payload = toErrorResponse(error);
    res.status(payload.status).json(payload.body);
  }
}
