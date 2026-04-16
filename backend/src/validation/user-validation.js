import { z } from 'zod';

const registerUserValidation = z.object({
    name: z.string().min(1, "Nama tidak boleh kosong").max(255),
    email: z.string().email("Format email tidak valid").max(255),
    password: z.string().min(8, "Password minimal 8 karakter").max(255),
});

const loginUserValidation = z.object({
    email: z.string().email("Format email tidak valid").max(255),
    password: z.string().min(1, "Password tidak boleh kosong").max(255),
});

export { registerUserValidation, loginUserValidation };
