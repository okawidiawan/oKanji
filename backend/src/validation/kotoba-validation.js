import { z } from 'zod';

/**
 * Skema validasi untuk membuat kotoba tunggal.
 */
const createKotobaValidation = z.object({
  word: z.string().min(1, "Word tidak boleh kosong").max(100, "Word maksimal 100 karakter"),
  reading: z.string().min(1, "Reading tidak boleh kosong").max(100, "Reading maksimal 100 karakter"),
  meaning: z.string().min(1, "Meaning tidak boleh kosong").max(500, "Meaning maksimal 500 karakter"),
  jlptLevel: z.string().regex(/^N[1-5]$/, "Format Level harus N1-N5").optional(),
  kanjiIds: z.array(z.string().uuid("Format Kanji ID harus UUID")).min(1, "Minimal harus terhubung ke satu kanji")
});

/**
 * Skema validasi untuk input kotoba (mendukung single object atau array of objects).
 */
const postKotobaValidation = z.union([
  createKotobaValidation,
  z.array(createKotobaValidation).min(1, "Batch input minimal harus berisi satu data")
]);

export { createKotobaValidation, postKotobaValidation };
