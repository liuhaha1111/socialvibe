import express from "express";
import { activityRoutes } from "./routes/activityRoutes.js";
import { favoriteRoutes } from "./routes/favoriteRoutes.js";
import { profileRoutes } from "./routes/profileRoutes.js";

export const app = express();

app.use(express.json());

app.use("/api/v1/activities", activityRoutes);
app.use("/api/v1/me", profileRoutes);
app.use("/api/v1/me", favoriteRoutes);

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    code: "OK",
    message: "healthy",
    data: null
  });
});
