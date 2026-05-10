import { z } from 'zod';

/**
 * Skema validasi untuk ID Kanji.
 */
const kanjiIdValidation = z.string().uuid("Invalid Kanji ID format");

/**
 * Skema validasi untuk membuat kotoba tunggal.
 */
const createKotobaValidation = z.object({
  word: z.string().min(1, "Word cannot be empty").max(100, "Word must not exceed 100 characters"),
  reading: z.string().min(1, "Reading cannot be empty").max(100, "Reading must not exceed 100 characters"),
  meaning: z.string().min(1, "Meaning cannot be empty").max(500, "Meaning must not exceed 500 characters"),
  jlptLevel: z.enum(["N5", "N4", "N3", "N2", "N1"], {
    errorMap: () => ({ message: "JLPT Level must be N1, N2, N3, N4, or N5" }),
  }).optional(),
  kanjiIds: z.array(kanjiIdValidation).min(1, "At least one kanji reference is required")
});

/**
 * Skema validasi untuk input kotoba (mendukung single object atau array of objects).
 */
const postKotobaValidation = z.union([
  createKotobaValidation,
  z.array(createKotobaValidation).min(1, "Batch input must contain at least one item")
]);

/**
 * Skema validasi untuk mengambil satu kotoba (menggunakan kotobaId).
 */
const getKotobaValidation = z.string().uuid("Invalid Kotoba ID format");

/**
 * Skema validasi untuk memperbarui data kotoba.
 */
const updateKotobaValidation = z.object({
  word: z.string().min(1, "Word cannot be empty").max(100, "Word must not exceed 100 characters").optional(),
  reading: z.string().min(1, "Reading cannot be empty").max(100, "Reading must not exceed 100 characters").optional(),
  meaning: z.string().min(1, "Meaning cannot be empty").max(500, "Meaning must not exceed 500 characters").optional(),
  jlptLevel: z.enum(["N5", "N4", "N3", "N2", "N1"], {
    errorMap: () => ({ message: "JLPT Level must be N1, N2, N3, N4, or N5" }),
  }).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided",
});

export { createKotobaValidation, postKotobaValidation, kanjiIdValidation, updateKotobaValidation, getKotobaValidation };
