import type { Request, Response } from "express";
import { z } from "zod";
import { toErrorResponse } from "../lib/errors.js";
import { getCurrentProfile, updateCurrentProfile } from "../services/profileService.js";

const UpdateProfileSchema = z
  .object({
    name: z.string().min(1).max(80).optional(),
    bio: z.string().max(500).optional(),
    email: z.string().email().optional(),
    location: z.string().max(120).optional(),
    avatar_url: z.string().url().optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required"
  });

export async function handleGetMeProfile(_req: Request, res: Response) {
  try {
    const data = await getCurrentProfile();
    res.status(200).json({
      code: "OK",
      message: "Profile fetched",
      data
    });
  } catch (error) {
    const payload = toErrorResponse(error);
    res.status(payload.status).json(payload.body);
  }
}

export async function handleUpdateMeProfile(req: Request, res: Response) {
  try {
    const body = UpdateProfileSchema.parse(req.body);
    const data = await updateCurrentProfile(body);
    res.status(200).json({
      code: "OK",
      message: "Profile updated",
      data
    });
  } catch (error) {
    const payload = toErrorResponse(error);
    res.status(payload.status).json(payload.body);
  }
}
