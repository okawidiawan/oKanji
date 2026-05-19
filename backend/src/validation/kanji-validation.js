import { z } from 'zod';

/**
 * Skema validasi untuk mengambil daftar kanji (query parameters).
 */
const getKanjiValidation = z.object({
  level: z.string().regex(/^N[1-5]$/, "Level format must be N1-N5").optional(),
  search: z.string().min(1).max(50).optional(),
  page: z.coerce.number().min(1, "Page must be at least 1").default(1),
  size: z.coerce.number().min(1, "Size must be at least 1").max(100, "Size must not exceed 100").default(20),
  sort_by: z.enum(["jlptLevel", "priority"]).default("jlptLevel"),
  sort_order: z.enum(["asc", "desc"], { message: "Sort order must be 'asc' or 'desc'" }).default("asc"),
});

const getKanjiByIdValidation = z.string().uuid("Invalid Kanji ID format");

/**
 * Skema validasi untuk satu objek update priority kanji.
 */
const kanjiPriorityItemValidation = z.object({
  kanjiId: z.string().uuid("Format ID Kanji tidak valid (harus UUID)"),
  priority: z.number().int().min(1, "Prioritas harus berupa bilangan bulat positif"),
});

/**
 * Skema validasi untuk batch update priority kanji.
 * Menerima array item priority (minimal 1 item).
 */
const updateKanjiPriorityValidation = z
  .array(kanjiPriorityItemValidation)
  .min(1, "Setidaknya harus ada satu data prioritas kanji yang dikirim");

export { getKanjiValidation, getKanjiByIdValidation, updateKanjiPriorityValidation };
