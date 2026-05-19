import { prisma } from '../application/database.js';
import { getKanjiValidation, getKanjiByIdValidation, updateKanjiPriorityValidation } from '../validation/kanji-validation.js';
import { ResponseError } from '../error/response-error.js';

/**
 * Mengambil daftar data kanji.
 * Mendukung filter level JLPT, pencarian teks (pada karakter atau arti), pengurutan, dan paginasi.
 */
const list = async (user, request) => {
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

  // Menyusun orderBy secara dinamis. Jika sort_by adalah "priority", data yang bernilai null (belum diberi prioritas) akan diletakkan di akhir.
  let orderBy;
  if (validatedRequest.sort_by === "priority") {
    orderBy = {
      priority: {
        sort: validatedRequest.sort_order,
        nulls: "last"
      }
    };
  } else {
    orderBy = {
      [validatedRequest.sort_by]: validatedRequest.sort_order,
    };
  }

  // Mengambil data dan total item secara paralel untuk efisiensi
  const [data, total] = await Promise.all([
    prisma.kanji.findMany({
      where: filters,
      take: validatedRequest.size,
      skip: skip,
      orderBy: orderBy,
      include: {
        userKanjis: {
          where: {
            userId: user.id,
          },
          select: {
            isMemorized: true,
          },
        },
      },
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
  const validationResult = getKanjiByIdValidation.safeParse(kanjiId);
  if (!validationResult.success) {
    throw new ResponseError(404, "Kanji not found");
  }
  const validatedId = validationResult.data;

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
    throw new ResponseError(404, "Kanji not found");
  }

  // Transformasi data: meratakan array kotoba dari junction table (FIX-4: gunakan destructuring)
  const { kanjiKotoba, ...kanjiData } = kanji;
  const kotoba = kanjiKotoba.map((item) => item.kotoba);

  return {
    ...kanjiData,
    kotoba
  };
};

/**
 * Melakukan batch update/pembaruan prioritas kanji.
 * Menggunakan transaksi database agar seluruh pembaruan berhasil atau gagal secara bersamaan (atomik).
 * 
 * @param {Array} request - Array berisi objek { kanjiId, priority }
 * @returns {Promise<Object>} Berisi jumlah data kanji yang berhasil diperbarui
 */
const updatePriority = async (request) => {
  // Validasi input data request
  const validatedRequest = updateKanjiPriorityValidation.parse(request);

  // Buat array query prisma update
  const updates = validatedRequest.map((item) =>
    prisma.kanji.update({
      where: { id: item.kanjiId },
      data: { priority: item.priority },
    })
  );

  // Jalankan transaksi database
  const results = await prisma.$transaction(updates);

  return {
    updated: results.length
  };
};

export { list, get, updatePriority };
