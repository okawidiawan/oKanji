import { z } from 'zod';

const getKanjiValidation = z.object({
  level: z.string().regex(/^N[1-5]$/, "Format Level harus N1-N5").optional(),
  page: z.coerce.number().min(1, "Page minimal adalah 1").default(1),
  limit: z.coerce.number().min(1, "Limit minimal adalah 1").max(100, "Limit maksimal adalah 100").default(20),
});

export { getKanjiValidation };
