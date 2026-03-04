import { Router } from "express";
import { handleAddFavorite, handleDeleteFavorite, handleGetFavorites } from "../controllers/favoriteController.js";

export const favoriteRoutes = Router();

favoriteRoutes.get("/favorites", handleGetFavorites);
favoriteRoutes.post("/favorites/:activityId", handleAddFavorite);
favoriteRoutes.delete("/favorites/:activityId", handleDeleteFavorite);
