import { prisma } from "../application/database.js";

const authMiddleware = async (req, res, next) => {
  const authHeader = req.get("Authorization");
  const token = authHeader ? authHeader.replace("Bearer ", "") : undefined;
  if (!token) {
    res
      .status(401)
      .json({
        errors: "Unauthorized",
      })
      .end();
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      token: token,
    },
    select: {
      id: true,
      username: true,
      email: true,
      token: true,
    },
  });

  if (!user) {
    res
      .status(401)
      .json({
        errors: "Unauthorized",
      })
      .end();
    return;
  }

  req.user = user;
  next();
};

export { authMiddleware };
