import { prisma } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import { addUserKanjiValidation, updateUserKanjiValidation, getUserKanjiValidation, listUserKanjiValidation } from "../validation/user-kanji-validation.js";

/**
 * Membuat atau memperbarui progres belajar kanji milik user.
 * Menggunakan operasi upsert untuk menangani penambahan baru atau pembaruan.
 */
const add = async (user, request) => {
  // Validasi input data progres
  const validatedRequest = addUserKanjiValidation.parse(request);

  // Memastikan data kanji yang direferensikan memang ada di database
  const kanjiCount = await prisma.kanji.count({
    where: { id: validatedRequest.kanjiId },
  });
  if (kanjiCount === 0) {
    throw new ResponseError(404, "Kanji tidak ditemukan");
  }

  // Mencari apakah sudah ada progres sebelumnya untuk pasangan user dan kanji ini
  const existing = await prisma.userKanji.findUnique({
    where: {
      userId_kanjiId: {
        userId: user.id,
        kanjiId: validatedRequest.kanjiId,
      },
    },
  });

  const now = new Date();

  // Melakukan operasi upsert (update if exists, create if not)
  // FIX-5: isMemorized di-hardcode ke false saat create dan tidak diubah saat update di endpoint add
  return prisma.userKanji.upsert({
    where: {
      userId_kanjiId: {
        userId: user.id,
        kanjiId: validatedRequest.kanjiId,
      },
    },
    update: {
      difficulty: validatedRequest.difficulty ?? existing?.difficulty,
      note: validatedRequest.note ?? existing?.note,
      reviewCount: { increment: 1 },
      lastReviewed: now,
    },
    create: {
      userId: user.id,
      kanjiId: validatedRequest.kanjiId,
      isMemorized: false,
      difficulty: validatedRequest.difficulty,
      note: validatedRequest.note,
      reviewCount: 1,
      lastReviewed: now,
      memorizedAt: null,
    },
  });
};

/**
 * Mengambil data detail progres belajar kanji tertentu milik user.
 * Menyertakan informasi detail kanji dari tabel Kanji.
 */
const get = async (user, kanjiId) => {
  // Validasi format ID kanji
  // Jika format tidak valid (bukan UUID), langsung lempar 404 agar seragam dengan data tidak ditemukan
  const validationResult = getUserKanjiValidation.safeParse(kanjiId);
  if (!validationResult.success) {
    throw new ResponseError(404, "Data Progress Kanji Tidak Ditemukan");
  }
  const validatedKanjiId = validationResult.data;

  const userKanji = await prisma.userKanji.findUnique({
    where: {
      userId_kanjiId: {
        userId: user.id,
        kanjiId: validatedKanjiId,
      },
    },
    include: {
      kanji: true, // Join dengan tabel kanji
    },
  });

  // Jika data progres belum ada, kembalikan 404
  if (!userKanji) {
    throw new ResponseError(404, "Data Progress Kanji Tidak Ditemukan");
  }

  return userKanji;
};

/**
 * Mengambil daftar seluruh progres belajar kanji milik user.
 * Mendukung filter status hafal (isMemorized) dan paginasi.
 */
const list = async (user, request) => {
  // Validasi parameter list
  const validatedRequest = listUserKanjiValidation.parse(request);
  const skip = (validatedRequest.page - 1) * validatedRequest.size;

  const filters = {
    userId: user.id,
  };

  // Filter berdasarkan status memorized jika disediakan
  if (validatedRequest.isMemorized !== undefined) {
    filters.isMemorized = validatedRequest.isMemorized;
  }

  // Mengambil data dengan urutan termutakhir di atas (updatedAt desc)
  const [data, total] = await Promise.all([
    prisma.userKanji.findMany({
      where: filters,
      take: validatedRequest.size,
      skip: skip,
      include: {
        kanji: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),
    prisma.userKanji.count({
      where: filters,
    }),
  ]);

  return {
    data,
    paging: {
      page: validatedRequest.page,
      total_item: total,
      total_page: Math.ceil(total / validatedRequest.size),
    },
  };
};

/**
 * Menghapus data progres belajar kanji tertentu milik user.
 * Memastikan data benar-benar milik user yang sedang login sebelum dihapus.
 */
const remove = async (user, kanjiId) => {
  // Validasi format ID kanji
  // Jika format tidak valid (bukan UUID), langsung lempar 404 agar seragam dengan data tidak ditemukan
  const validationResult = getUserKanjiValidation.safeParse(kanjiId);
  if (!validationResult.success) {
    throw new ResponseError(404, "Data Progress Kanji Tidak Ditemukan");
  }
  const validatedKanjiId = validationResult.data;

  // Mencari data progres berdasarkan userId dan kanjiId
  const userKanji = await prisma.userKanji.findUnique({
    where: {
      userId_kanjiId: {
        userId: user.id,
        kanjiId: validatedKanjiId,
      },
    },
  });

  // Jika data tidak ditemukan, lempar error 404
  if (!userKanji) {
    throw new ResponseError(404, "Data Progress Kanji Tidak Ditemukan");
  }

  // Menghapus data progres dari database
  return prisma.userKanji.delete({
    where: {
      userId_kanjiId: {
        userId: user.id,
        kanjiId: validatedKanjiId,
      },
    },
  });
};

/**
 * Memperbarui progres belajar kanji milik user secara parsial.
 * Menjamin keamanan data (Data Isolation) melalui pengecekan kepemilikan.
 */
const update = async (user, request) => {
  // Validasi input pembaruan
  const validatedRequest = updateUserKanjiValidation.parse(request);

  // Mencari data progres yang ada untuk memastikan kepemilikan (Data Isolation)
  const existing = await prisma.userKanji.findUnique({
    where: {
      userId_kanjiId: {
        userId: user.id,
        kanjiId: validatedRequest.kanjiId,
      },
    },
  });

  // Jika data tidak ditemukan, lempar 404
  if (!existing) {
    throw new ResponseError(404, "Data Progress Kanji Tidak Ditemukan");
  }

  const now = new Date();
  let memorizedAt = existing.memorizedAt;

  // Logika pembaruan tanggal hafal: jika baru saja ditandai hafal atau dibatalkan
  if (validatedRequest.isMemorized === true && !existing.isMemorized) {
    memorizedAt = now;
  } else if (validatedRequest.isMemorized === false) {
    memorizedAt = null;
  }

  // Melakukan pembaruan data progres di database
  return prisma.userKanji.update({
    where: {
      userId_kanjiId: {
        userId: user.id,
        kanjiId: validatedRequest.kanjiId,
      },
    },
    data: {
      isMemorized: validatedRequest.isMemorized ?? existing.isMemorized,
      difficulty: validatedRequest.difficulty ?? existing.difficulty,
      note: validatedRequest.note ?? existing.note,
      reviewCount: { increment: 1 }, // Setiap interaksi dihitung sebagai review
      lastReviewed: now,
      memorizedAt: memorizedAt,
    },
  });
};

export { add, get, list, remove, update };
