import { prisma } from "../application/database.js";

/**
 * Middleware untuk memverifikasi token autentikasi (Bearer Token).
 * Mengambil data user dari database dan melampirkannya ke objek request.
 */
const authMiddleware = async (req, res, next) => {
  // Mengambil token dari header Authorization
  const authHeader = req.get("Authorization");
  const token = authHeader ? authHeader.replace("Bearer ", "") : undefined;
  
  // Jika token tidak ada, kembalikan 401 Unauthorized
  if (!token) {
    res
      .status(401)
      .json({
        error: "Unauthorized",
      })
      .end();
    return;
  }

  // Mencari user berdasarkan token di database
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

  // Jika user tidak ditemukan (token tidak valid), kembalikan 401
  if (!user) {
    res
      .status(401)
      .json({
        error: "Unauthorized",
      })
      .end();
    return;
  }

  // Menyimpan data user ke req agar bisa diakses di controller
  req.user = user;
  next();
};

export { authMiddleware };
