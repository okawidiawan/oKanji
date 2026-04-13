const userService = require('../services/user-service');

const register = async (req, res, next) => {
  try {
    await userService.register(req.body);
    res.status(200).json({
      data: "OK"
    });
  } catch (e) {
    next(e);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body);
    res.status(200).json({
      data: result.token
    });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  register,
  login
};
