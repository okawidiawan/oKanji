import { z } from 'zod';

/**
 * Skema validasi untuk ID Kotoba (URL Parameter).
 */
const getUserKotobaValidation = z.string().uuid("Invalid Kotoba ID format");

/**
 * Skema validasi untuk memperbarui progres belajar kotoba.
 * Semua field opsional, namun minimal satu harus diisi.
 */
const updateUserKotobaValidation = z.object({
    kotobaId: z.string().uuid("Invalid Kotoba ID format"),
    isMemorized: z.boolean().optional(),
    difficulty: z.number().min(1, "Difficulty must be at least 1").max(5, "Difficulty must not exceed 5").optional(),
    note: z.string().max(2000, "Note must not exceed 2000 characters").optional(),
    reviewCount: z.number().min(0).optional(),
}).refine(data => data.isMemorized !== undefined || data.difficulty !== undefined || data.note !== undefined || data.reviewCount !== undefined, {
    message: "At least one field must be provided (isMemorized, difficulty, note, or reviewCount)"
});

export {
    getUserKotobaValidation,
    updateUserKotobaValidation
};
