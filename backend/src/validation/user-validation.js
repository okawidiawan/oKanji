import { z } from 'zod';

const registerUserValidation = z.object({
    name: z.string().min(1, "Nama tidak boleh kosong").max(255, "Nama maksimal 255 karakter"),
    email: z.string().email("Format email tidak valid").max(255, "Email maksimal 255 karakter"),
    password: z.string().min(8, "Password minimal 8 karakter").max(255, "Password maksimal 255 karakter"),
});

const loginUserValidation = z.object({
    email: z.string().email("Format email tidak valid").max(255, "Email maksimal 255 karakter"),
    password: z.string().min(1, "Password tidak boleh kosong").max(255, "Password maksimal 255 karakter"),
});

export { registerUserValidation, loginUserValidation };
