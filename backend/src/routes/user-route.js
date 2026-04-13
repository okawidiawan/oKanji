const express = require('express');
const userController = require('../controller/user-controller');

const userRouter = new express.Router();

userRouter.post('/api/users', userController.register);
userRouter.post('/api/users/login', userController.login);

module.exports = {
  userRouter
};
