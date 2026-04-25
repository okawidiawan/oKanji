import { z } from 'zod';

/**
 * Skema validasi untuk ID Kanji.
 */
const kanjiIdValidation = z.string().uuid("Format ID Kanji tidak valid");

/**
 * Skema validasi untuk membuat kotoba tunggal.
 */
const createKotobaValidation = z.object({
  word: z.string().min(1, "Word tidak boleh kosong").max(100, "Word maksimal 100 karakter"),
  reading: z.string().min(1, "Reading tidak boleh kosong").max(100, "Reading maksimal 100 karakter"),
  meaning: z.string().min(1, "Meaning tidak boleh kosong").max(500, "Meaning maksimal 500 karakter"),
  jlptLevel: z.enum(["N5", "N4", "N3", "N2", "N1"], {
    errorMap: () => ({ message: "Level JLPT harus N1, N2, N3, N4, atau N5" }),
  }).optional(),
  kanjiIds: z.array(kanjiIdValidation).min(1, "Minimal harus terhubung ke satu kanji")
});

/**
 * Skema validasi untuk input kotoba (mendukung single object atau array of objects).
 */
const postKotobaValidation = z.union([
  createKotobaValidation,
  z.array(createKotobaValidation).min(1, "Batch input minimal harus berisi satu data")
]);

/**
 * Skema validasi untuk mengambil satu kotoba (menggunakan kotobaId).
 */
const getKotobaValidation = z.string().uuid("Format ID Kotoba tidak valid");

/**
 * Skema validasi untuk memperbarui data kotoba.
 */
const updateKotobaValidation = z.object({
  word: z.string().min(1, "Word tidak boleh kosong").max(100, "Word maksimal 100 karakter").optional(),
  reading: z.string().min(1, "Reading tidak boleh kosong").max(100, "Reading maksimal 100 karakter").optional(),
  meaning: z.string().min(1, "Meaning tidak boleh kosong").max(500, "Meaning maksimal 500 karakter").optional(),
  jlptLevel: z.enum(["N5", "N4", "N3", "N2", "N1"], {
    errorMap: () => ({ message: "Level JLPT harus N1, N2, N3, N4, atau N5" }),
  }).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "Setidaknya satu field harus diisi",
});

export { createKotobaValidation, postKotobaValidation, kanjiIdValidation, updateKotobaValidation, getKotobaValidation };
