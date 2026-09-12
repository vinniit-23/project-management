import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Express Basic configurations
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Cors configutations
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "https://localhost:5173",
    methods: "GET,POST,DELETE,PUT,PATCH,HEAD,OPTIONS",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

import healthCheckRouter from "./routes/healthcheck.route.js";
import authRouter from "./routes/auth.routes.js";
app.use("/api/v1/healthCheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/vinit", (req, res) => {
  res.send(
    "Vinit this side, Hello from the vinit's project managemenet app backend",
  );
});

export default app;
