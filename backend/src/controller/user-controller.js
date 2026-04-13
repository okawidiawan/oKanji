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

module.exports = {
  register
};
