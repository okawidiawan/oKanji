import { z } from 'zod';

/**
 * Skema validasi untuk mengambil daftar kanji (query parameters).
 */
const getKanjiValidation = z.object({
  level: z.string().regex(/^N[1-5]$/, "Level format must be N1-N5").optional(),
  search: z.string().min(1).max(50).optional(),
  page: z.coerce.number().min(1, "Page must be at least 1").default(1),
  size: z.coerce.number().min(1, "Size must be at least 1").max(100, "Size must not exceed 100").default(20),
});

const getKanjiByIdValidation = z.string().uuid("Invalid Kanji ID format");

export { getKanjiValidation, getKanjiByIdValidation };
