import { z } from "zod";
import { AppError, toErrorResponse } from "../lib/errors.js";
import { addFavorite, listMyFavorites, removeFavorite } from "../services/favoriteService.js";
const ParamsSchema = z.object({
    activityId: z.string().uuid()
});
export async function handleGetFavorites(req, res) {
    try {
        if (!req.auth) {
            throw new AppError(401, "UNAUTHORIZED", "Missing bearer token");
        }
        const data = await listMyFavorites(req.auth.userId, req.auth.email);
        res.status(200).json({
            code: "OK",
            message: "Favorites fetched",
            data
        });
    }
    catch (error) {
        const payload = toErrorResponse(error);
        res.status(payload.status).json(payload.body);
    }
}
export async function handleAddFavorite(req, res) {
    try {
        if (!req.auth) {
            throw new AppError(401, "UNAUTHORIZED", "Missing bearer token");
        }
        const params = ParamsSchema.parse(req.params);
        await addFavorite(req.auth.userId, params.activityId, req.auth.email);
        res.status(201).json({
            code: "CREATED",
            message: "Favorite created",
            data: null
        });
    }
    catch (error) {
        const payload = toErrorResponse(error);
        res.status(payload.status).json(payload.body);
    }
}
export async function handleDeleteFavorite(req, res) {
    try {
        if (!req.auth) {
            throw new AppError(401, "UNAUTHORIZED", "Missing bearer token");
        }
        const params = ParamsSchema.parse(req.params);
        await removeFavorite(req.auth.userId, params.activityId, req.auth.email);
        res.status(204).send();
    }
    catch (error) {
        const payload = toErrorResponse(error);
        res.status(payload.status).json(payload.body);
    }
}
