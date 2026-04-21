import { prisma } from '../application/database.js';
import { getKanjiValidation } from '../validation/kanji-validation.js';

const list = async (request) => {
  const validatedRequest = getKanjiValidation.parse(request);
  const skip = (validatedRequest.page - 1) * validatedRequest.limit;

  const filters = {};
  if (validatedRequest.level) {
    filters.jlptLevel = validatedRequest.level;
  }

  if (validatedRequest.search) {
    filters.OR = [
      { character: { contains: validatedRequest.search } },
      { meaning: { contains: validatedRequest.search } }
    ];
  }

  const [data, total] = await Promise.all([
    prisma.kanji.findMany({
      where: filters,
      take: validatedRequest.limit,
      skip: skip
    }),
    prisma.kanji.count({
      where: filters
    })
  ]);

  return {
    data,
    paging: {
      page: validatedRequest.page,
      total_item: total,
      total_page: Math.ceil(total / validatedRequest.limit)
    }
  };
};

export { list };
