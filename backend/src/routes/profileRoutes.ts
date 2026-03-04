import { Router } from "express";
import { handleGetMeProfile, handleUpdateMeProfile } from "../controllers/profileController.js";

export const profileRoutes = Router();

profileRoutes.get("/profile", handleGetMeProfile);
profileRoutes.put("/profile", handleUpdateMeProfile);
