import { Router } from "express";
import { handleGetActivities, handleGetActivityById } from "../controllers/activityController.js";

export const activityRoutes = Router();

activityRoutes.get("/", handleGetActivities);
activityRoutes.get("/:id", handleGetActivityById);
