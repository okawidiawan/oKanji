import { z } from 'zod';

/**
 * Skema validasi untuk ID Kotoba (URL Parameter).
 */
const getUserKotobaValidation = z.string().uuid("Format ID Kotoba tidak valid");

/**
 * Skema validasi untuk memperbarui progres belajar kotoba.
 * Semua field opsional, namun minimal satu harus diisi.
 */
const updateUserKotobaValidation = z.object({
    kotobaId: z.string().uuid("Format ID Kotoba tidak valid"),
    isMemorized: z.boolean().optional(),
    difficulty: z.number().min(1, "Tingkat kesulitan minimal 1").max(5, "Tingkat kesulitan maksimal 5").optional(),
    note: z.string().max(2000, "Catatan maksimal 2000 karakter").optional(),
}).refine(data => data.isMemorized !== undefined || data.difficulty !== undefined || data.note !== undefined, {
    message: "Minimal satu field harus diisi (isMemorized, difficulty, atau note)"
});

export {
    getUserKotobaValidation,
    updateUserKotobaValidation
};
