import { z } from 'zod';

/**
 * Skema validasi untuk membuat atau memperbarui progres belajar kanji.
 */
const addUserKanjiValidation = z.object({
    kanjiId: z.string().uuid("Invalid Kanji ID format"),
    difficulty: z.number().min(1, "Difficulty must be at least 1").max(5, "Difficulty must not exceed 5").optional(),
    note: z.string().max(2000, "Note must not exceed 2000 characters").optional(),
    reviewCount: z.number().min(0).optional(),
});

/**
 * Skema validasi untuk ID Kanji (URL Parameter).
 */
const getUserKanjiValidation = z.string().uuid("Invalid Kanji ID format");

/**
 * Skema validasi untuk query parameter saat mengambil daftar progres belajar.
 */
const listUserKanjiValidation = z.object({
    page: z.coerce.number().min(1, "Page must be at least 1").default(1),
    size: z.coerce.number().min(1, "Size must be at least 1").max(100, "Size must not exceed 100").default(10),
    isMemorized: z.preprocess(val => {
        if (val === "true" || val === true) return true;
        if (val === "false" || val === false) return false;
        return undefined;
    }, z.boolean().optional()),
});

/**
 * Skema validasi untuk memperbarui progres belajar kanji.
 * Semua field opsional, namun minimal satu harus diisi.
 */
const updateUserKanjiValidation = z.object({
    kanjiId: z.string().uuid("Invalid Kanji ID format"),
    isMemorized: z.boolean().optional(),
    difficulty: z.number().min(1, "Difficulty must be at least 1").max(5, "Difficulty must not exceed 5").optional(),
    note: z.string().max(2000, "Note must not exceed 2000 characters").optional(),
    reviewCount: z.number().min(0).optional(),
}).refine(data => data.isMemorized !== undefined || data.difficulty !== undefined || data.note !== undefined || data.reviewCount !== undefined, {
    message: "At least one field must be provided (isMemorized, difficulty, note, or reviewCount)"
});

export {
    addUserKanjiValidation,
    updateUserKanjiValidation,
    getUserKanjiValidation,
    listUserKanjiValidation
};
