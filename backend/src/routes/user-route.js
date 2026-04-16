import express from 'express';
import * as userController from '../controller/user-controller.js';
import { authMiddleware } from '../middleware/auth-middleware.js';

const userRouter = express.Router();

userRouter.post('/api/users', userController.register);
userRouter.post('/api/users/login', userController.login);
userRouter.delete('/api/users/logout', authMiddleware, userController.logout);

export { userRouter };
