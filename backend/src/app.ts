import express from "express";
import { activityRoutes } from "./routes/activityRoutes.js";
import { chatRoutes } from "./routes/chatRoutes.js";
import { favoriteRoutes } from "./routes/favoriteRoutes.js";
import { friendRoutes } from "./routes/friendRoutes.js";
import { profileRoutes } from "./routes/profileRoutes.js";

function readAllowedOrigins(): string[] {
  return (process.env.CORS_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const app = express();

app.use((req, res, next) => {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : undefined;
  const allowedOrigins = readAllowedOrigins();
  const allowAnyOrigin = allowedOrigins.length === 0 && process.env.NODE_ENV !== "production";
  const allowListedOrigin = origin ? allowedOrigins.includes(origin) : false;

  if (origin && (allowAnyOrigin || allowListedOrigin)) {
    res.setHeader("Access-Control-Allow-Origin", allowAnyOrigin ? "*" : origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }

  if (req.method === "OPTIONS") {
    res.status(origin && (allowAnyOrigin || allowListedOrigin) ? 204 : 403).end();
    return;
  }

  next();
});

app.use(express.json());

app.use("/api/v1/activities", activityRoutes);
app.use("/api/v1/me", profileRoutes);
app.use("/api/v1/me", favoriteRoutes);
app.use("/api/v1/friends", friendRoutes);
app.use("/api/v1/chat", chatRoutes);

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    code: "OK",
    message: "healthy",
    data: null
  });
});
