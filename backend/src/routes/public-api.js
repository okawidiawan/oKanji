import express from 'express';
import rateLimit from 'express-rate-limit';
import * as userController from '../controller/user-controller.js';

const publicRouter = express.Router();

// FIX-7: Rate limiting khusus untuk login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 10, // max 10 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Terlalu banyak percobaan login, coba lagi nanti.",
    },
});

/**
 * API Publik: Endpoint yang bisa diakses tanpa token autentikasi.
 */
publicRouter.post('/api/users', userController.register); // Registrasi user baru
publicRouter.post('/api/users/login', loginLimiter, userController.login);    // Login user
publicRouter.get('/api/health', (req, res) => {
    res.json({ status: "OK", message: "Backend is running" });
});

export { publicRouter };
