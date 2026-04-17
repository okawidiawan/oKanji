import { z } from 'zod';

const getKanjiValidation = z.object({
  level: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export { getKanjiValidation };
