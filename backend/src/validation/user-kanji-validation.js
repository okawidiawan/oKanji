import { z } from 'zod';

/**
 * Skema validasi untuk membuat atau memperbarui progres belajar kanji.
 */
const createOrUpdateUserKanjiValidation = z.object({
    kanjiId: z.string().uuid("Format ID Kanji tidak valid"),
    isMemorized: z.boolean().optional(),
    difficulty: z.number().min(1, "Tingkat kesulitan minimal 1").max(5, "Tingkat kesulitan maksimal 5").optional(),
    note: z.string().max(2000, "Catatan maksimal 2000 karakter").optional(),
});

/**
 * Skema validasi untuk ID Kanji (URL Parameter).
 */
const getUserKanjiValidation = z.string().uuid("Format ID Kanji tidak valid");

/**
 * Skema validasi untuk query parameter saat mengambil daftar progres belajar.
 */
const listUserKanjiValidation = z.object({
    page: z.coerce.number().min(1, "Page minimal adalah 1").default(1),
    size: z.coerce.number().min(1, "Size minimal adalah 1").max(100, "Size maksimal adalah 100").default(10),
    isMemorized: z.coerce.boolean().optional(),
});

export {
    createOrUpdateUserKanjiValidation,
    getUserKanjiValidation,
    listUserKanjiValidation
};
