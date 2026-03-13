import { Router } from "express";
import { handleAddFavorite, handleDeleteFavorite, handleGetFavorites } from "../controllers/favoriteController.js";
import { requireAuth } from "../middleware/auth.js";

export const favoriteRoutes = Router();
favoriteRoutes.use(requireAuth);

favoriteRoutes.get("/favorites", handleGetFavorites);
favoriteRoutes.post("/favorites/:activityId", handleAddFavorite);
favoriteRoutes.delete("/favorites/:activityId", handleDeleteFavorite);
