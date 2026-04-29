import crypto from "crypto";
import { prisma } from "../application/database.js";

/**
 * Middleware untuk memverifikasi token autentikasi (Bearer Token).
 * Mengambil data user dari database dan melampirkannya ke objek request.
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Mengambil token dari header Authorization
    const authHeader = req.get("Authorization");
    
    // Validasi format Authorization header (Bearer <token>)
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Ekstraksi token dari header
    const token = authHeader.slice(7);
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // FIX-9: Hash token sebelum dicari di database
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Mencari user berdasarkan token di database
    const user = await prisma.user.findUnique({
      where: {
        token: hashedToken,
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
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Menyimpan data user ke req agar bisa diakses di controller
    req.user = user;
    next();
  } catch (e) {
    // Meneruskan error database atau error lainnya ke error middleware
    next(e);
  }
};

export { authMiddleware };
