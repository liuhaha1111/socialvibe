import express from "express";

export const app = express();

app.use(express.json());

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    code: "OK",
    message: "healthy",
    data: null
  });
});
