import { Router } from "express";
import { handleGetMeProfile, handleUpdateMeProfile } from "../controllers/profileController.js";
import { requireAuth } from "../middleware/auth.js";
export const profileRoutes = Router();
profileRoutes.use(requireAuth);
profileRoutes.get("/profile", handleGetMeProfile);
profileRoutes.put("/profile", handleUpdateMeProfile);
