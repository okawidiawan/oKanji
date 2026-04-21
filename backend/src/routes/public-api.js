import express from 'express';
import * as userController from '../controller/user-controller.js';

const publicRouter = express.Router();

/**
 * API Publik: Endpoint yang bisa diakses tanpa token autentikasi.
 */
publicRouter.post('/api/users', userController.register); // Registrasi user baru
publicRouter.post('/api/users/login', userController.login);    // Login user

export { publicRouter };
