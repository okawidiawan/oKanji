import express from 'express';
import * as userController from '../controller/user-controller.js';

const userRouter = express.Router();

userRouter.post('/api/users', userController.register);
userRouter.post('/api/users/login', userController.login);

export { userRouter };
