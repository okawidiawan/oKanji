import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { publicRouter } from "../routes/public-api.js";
import { apiRouter } from "../routes/api.js";
import { errorMiddleware } from "../error/error-middleware.js";

const app = express();

// Security headers
app.use(helmet());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // max 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 429,
      message: "Terlalu banyak request, coba lagi nanti.",
    },
  },
});
app.use("/api/", apiLimiter);

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : ["http://localhost:3000"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());



// Routes
app.use(publicRouter);
app.use(apiRouter);

// Error middleware (must be after routes)
app.use(errorMiddleware);

export { app };
