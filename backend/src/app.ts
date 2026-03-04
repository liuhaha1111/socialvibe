import express from "express";
import { activityRoutes } from "./routes/activityRoutes.js";

export const app = express();

app.use(express.json());

app.use("/api/v1/activities", activityRoutes);

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    code: "OK",
    message: "healthy",
    data: null
  });
});
