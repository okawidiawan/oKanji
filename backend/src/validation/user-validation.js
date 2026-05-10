import { z } from "zod";

/**
 * Skema validasi untuk registrasi user baru.
 */
const registerUserValidation = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  name: z.string().min(1, "Name cannot be empty").max(255, "Name must not exceed 255 characters"),
  email: z.string().email("Invalid email format").max(255, "Email must not exceed 255 characters"),
  password: z.string().min(8, "Password must be at least 8 characters").max(255, "Password must not exceed 255 characters"),
});

/**
 * Skema validasi untuk login.
 */
const loginUserValidation = z
  .object({
    username: z.string().min(1, "Username cannot be empty").max(255, "Username must not exceed 255 characters").optional(),
    email: z.string().email("Invalid email format").max(255, "Email must not exceed 255 characters").optional(),
    password: z.string().min(1, "Password cannot be empty").max(255, "Password must not exceed 255 characters"),
  })
  .refine((data) => data.username || data.email, {
    message: "At least one of username or email must be provided",
  });

/**
 * Skema validasi untuk update profil user.
 */
const updateUserValidation = z
  .object({
    name: z.string().min(1, "Name cannot be empty").max(255, "Name must not exceed 255 characters").optional(),
    email: z.string().email("Invalid email format").max(255, "Email must not exceed 255 characters").optional(),
    password: z.string().min(8, "Password must be at least 8 characters").max(255, "Password must not exceed 255 characters").optional(),
  })
  .refine((data) => data.name !== undefined || data.email !== undefined || data.password !== undefined, {
    message: "At least one field must be provided (name, email, or password)",
  });

export { registerUserValidation, loginUserValidation, updateUserValidation };
