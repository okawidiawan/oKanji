import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { userRouter } from '../routes/user-route.js';
import { userKanjiRouter } from '../routes/user-kanji-route.js';
import { errorMiddleware } from '../error/error-middleware.js';

const app = express();

// Security headers
app.use(helmet());

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 100,                  // max 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: {
            code: 429,
            message: "Terlalu banyak request, coba lagi nanti."
        }
    }
});
app.use('/api/', apiLimiter);

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());

// Basic health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Backend is running' });
});

// Routes
app.use(userRouter);
app.use(userKanjiRouter);

// Error middleware (must be after routes)
app.use(errorMiddleware);

export { app };
