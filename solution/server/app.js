import "dotenv/config";
import express from "express";
import cors from "cors";
import authRouter from "./apps/auth.js";
import postRouter from "./apps/posts.js";
import connectionPool from "./utils/db.js";

const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", async (req, res) => {
  try {
    await connectionPool.query("SELECT 1 AS ready");

    return res.status(200).json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error("[GET /health] error:", error.message);
    return res.status(503).json({
      status: "error",
      database: "disconnected",
    });
  }
});

app.use("/auth", authRouter);
app.use("/posts", postRouter);

app.use((req, res) => {
  return res.status(404).json({
    message: "Route not found",
  });
});

app.listen(port, () => {
  console.log(`Blog Studio API running at http://localhost:${port}`);
});
