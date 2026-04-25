import { prisma } from '../application/database.js';
import { getKanjiValidation, getKanjiByIdValidation } from '../validation/kanji-validation.js';
import { ResponseError } from '../error/response-error.js';

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

/**
 * Mengambil detail satu kanji berdasarkan ID.
 * Termasuk daftar kotoba yang terkait.
 */
const get = async (kanjiId) => {
  // Validasi ID kanji
  const validatedId = getKanjiByIdValidation.parse(kanjiId);

  // Cari kanji di database beserta kotoba terkait melalui junction table
  const kanji = await prisma.kanji.findUnique({
    where: { id: validatedId },
    include: {
      kanjiKotoba: {
        include: {
          kotoba: true
        }
      }
    }
  });

  // Lempar error jika kanji tidak ditemukan
  if (!kanji) {
    throw new ResponseError(404, "Kanji tidak ditemukan");
  }

  // Transformasi data: meratakan array kotoba dari junction table
  const kotoba = kanji.kanjiKotoba.map((item) => item.kotoba);
  
  // Hapus properti junction table dari object response
  delete kanji.kanjiKotoba;

  return {
    ...kanji,
    kotoba
  };
};

export { list, get };
