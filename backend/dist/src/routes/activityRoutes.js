import { Router } from "express";
import { handleCreateActivity, handleGetActivities, handleGetActivityById, handleJoinActivity } from "../controllers/activityController.js";
import { requireAuth } from "../middleware/auth.js";
export const activityRoutes = Router();
// Access policy for this change: activity reads/writes are authenticated endpoints.
activityRoutes.use(requireAuth);
activityRoutes.get("/", handleGetActivities);
activityRoutes.post("/", handleCreateActivity);
activityRoutes.get("/:id", handleGetActivityById);
activityRoutes.post("/:id/join", handleJoinActivity);
