import { prisma } from '../application/database.js';
import { getKanjiValidation } from '../validation/kanji-validation.js';

/**
 * Mengambil daftar data kanji.
 * Mendukung filter level JLPT, pencarian teks (pada karakter atau arti), dan paginasi.
 */
const list = async (request) => {
  // Validasi input request menggunakan Zod
  const validatedRequest = getKanjiValidation.parse(request);
  const skip = (validatedRequest.page - 1) * validatedRequest.size;

  const filters = {};
  
  // Menambahkan filter level JLPT jika disediakan
  if (validatedRequest.level) {
    filters.jlptLevel = validatedRequest.level;
  }

  // Menambahkan logic pencarian (OR) pada kolom character atau meaning
  if (validatedRequest.search) {
    filters.OR = [
      { character: { contains: validatedRequest.search } },
      { meaning: { contains: validatedRequest.search } }
    ];
  }

  // Mengambil data dan total item secara paralel untuk efisiensi
  const [data, total] = await Promise.all([
    prisma.kanji.findMany({
      where: filters,
      take: validatedRequest.size,
      skip: skip
    }),
    prisma.kanji.count({
      where: filters
    })
  ]);

  // Mengembalikan data beserta informasi paginasi
  return {
    data,
    paging: {
      page: validatedRequest.page,
      total_item: total,
      total_page: Math.ceil(total / validatedRequest.size)
    }
  };
};

export { list };
