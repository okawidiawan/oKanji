const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { ResponseError } = require('../error/response-error');

const prisma = new PrismaClient();

const register = async (request) => {
  const countUser = await prisma.user.count({
    where: {
      email: request.email
    }
  });

  if (countUser === 1) {
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

module.exports = {
  register
};
