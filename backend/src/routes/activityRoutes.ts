import { Router } from "express";
import { handleCreateActivity, handleGetActivities, handleGetActivityById } from "../controllers/activityController.js";

export const activityRoutes = Router();

activityRoutes.get("/", handleGetActivities);
activityRoutes.post("/", handleCreateActivity);
activityRoutes.get("/:id", handleGetActivityById);
