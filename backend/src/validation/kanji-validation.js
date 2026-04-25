import { z } from 'zod';

/**
 * Skema validasi untuk mengambil daftar kanji (query parameters).
 */
const getKanjiValidation = z.object({
  level: z.string().regex(/^N[1-5]$/, "Format Level harus N1-N5").optional(),
  search: z.string().min(1).max(50).optional(),
  page: z.coerce.number().min(1, "Page minimal adalah 1").default(1),
  size: z.coerce.number().min(1, "Size minimal adalah 1").max(100, "Size maksimal adalah 100").default(20),
});

const getKanjiByIdValidation = z.string().uuid("Format Kanji ID tidak valid");

export { getKanjiValidation, getKanjiByIdValidation };
