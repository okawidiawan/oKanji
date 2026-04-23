import { z } from "zod";

/**
 * Skema validasi untuk registrasi user baru.
 */
const registerUserValidation = z.object({
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(50, "Username maksimal 50 karakter")
    .regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh mengandung huruf, angka, dan underscore"),
  name: z.string().min(1, "Nama tidak boleh kosong").max(255, "Nama maksimal 255 karakter"),
  email: z.string().email("Format email tidak valid").max(255, "Email maksimal 255 karakter"),
  password: z.string().min(8, "Password minimal 8 karakter").max(255, "Password maksimal 255 karakter"),
});

/**
 * Skema validasi untuk login.
 */
const loginUserValidation = z
  .object({
    username: z.string().min(1, "Username tidak boleh kosong").max(255, "Username maksimal 255 karakter").optional(),
    email: z.string().email("Format email tidak valid").max(255, "Email maksimal 255 karakter").optional(),
    password: z.string().min(1, "Password tidak boleh kosong").max(255, "Password maksimal 255 karakter"),
  })
  .refine((data) => data.username || data.email, {
    message: "Minimal salah satu dari username atau email harus diisi",
  });

/**
 * Skema validasi untuk update profil user.
 */
const updateUserValidation = z
  .object({
    name: z.string().min(1, "Nama tidak boleh kosong").max(255, "Nama maksimal 255 karakter").optional(),
    email: z.string().email("Format email tidak valid").max(255, "Email maksimal 255 karakter").optional(),
    password: z.string().min(8, "Password minimal 8 karakter").max(255, "Password maksimal 255 karakter").optional(),
  })
  .refine((data) => data.name !== undefined || data.email !== undefined || data.password !== undefined, {
    message: "Minimal satu field harus diisi (name, email, atau password)",
  });

export { registerUserValidation, loginUserValidation, updateUserValidation };
