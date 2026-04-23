import express from 'express';
import * as userController from '../controller/user-controller.js';

const publicRouter = express.Router();

/**
 * API Publik: Endpoint yang bisa diakses tanpa token autentikasi.
 */
publicRouter.post('/api/users', userController.register); // Registrasi user baru
publicRouter.post('/api/users/login', userController.login);    // Login user
publicRouter.get('/api/health', (req, res) => {
    res.json({ status: "OK", message: "Backend is running" });
});

export { publicRouter };
