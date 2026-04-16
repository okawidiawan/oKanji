const bcrypt = require('bcrypt');
const { prisma } = require('../application/database');
const { ResponseError } = require('../error/response-error');
const { v4: uuid } = require('uuid');
const { registerUserValidation, loginUserValidation } = require('../validation/user-validation');

const register = async (request) => {
  request = registerUserValidation.parse(request);

  const countUser = await prisma.user.count({
    where: {
      email: request.email
    }
  });

  if (countUser > 0) {
    throw new ResponseError(400, "Email sudah terdaftar");
  }

  const password = await bcrypt.hash(request.password, 10);

  return prisma.user.create({
    data: {
      username: request.name,
      email: request.email,
      password: password
    },
    select: {
      email: true
    }
  });
};

const login = async (request) => {
  request = loginUserValidation.parse(request);

  const user = await prisma.user.findUnique({
    where: {
      email: request.email
    }
  });

  if (!user) {
    throw new ResponseError(401, "Email atau password salah");
  }

  const isPasswordValid = await bcrypt.compare(request.password, user.password);
  if (!isPasswordValid) {
    throw new ResponseError(401, "Email atau password salah");
  }

  const token = uuid();
  return prisma.user.update({
    where: {
      email: request.email
    },
    data: {
      token: token
    },
    select: {
      token: true
    }
  });
};

module.exports = {
  register,
  login
};
