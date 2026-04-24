import { prisma } from "../application/database.js";
import { postKotobaValidation, kanjiIdValidation } from "../validation/kotoba-validation.js";
import { ResponseError } from "../error/response-error.js";

/**
 * Memastikan semua kanjiId yang dikirimkan ada di database.
 * @param {string[]} kanjiIds
 */
const validateKanjiExistence = async (kanjiIds) => {
  const uniqueKanjiIds = [...new Set(kanjiIds)];

  // Validasi format UUID untuk setiap ID
  for (const id of uniqueKanjiIds) {
    const validationResult = kanjiIdValidation.safeParse(id);
    if (!validationResult.success) {
      throw new ResponseError(400, "Format ID Kanji tidak valid");
    }
  }

  const count = await prisma.kanji.count({
    where: {
      id: { in: uniqueKanjiIds },
    },
  });

  if (count !== uniqueKanjiIds.length) {
    throw new ResponseError(404, "Kanji tidak ditemukan");
  }
};

/**
 * Memastikan kombinasi word dan reading belum ada di database.
 * @param {string} word
 * @param {string} reading
 */
const validateDuplicateKotoba = async (word, reading) => {
  const count = await prisma.kotoba.count({
    where: {
      word: word,
      reading: reading,
    },
  });

  if (count > 0) {
    throw new ResponseError(400, "Kosakata sudah terdaftar");
  }
};

/**
 * Membuat data kotoba baru (single atau batch) dan menghubungkannya dengan kanji.
 */
const create = async (request) => {
  // Validasi input request menggunakan Zod
  const validatedRequest = postKotobaValidation.parse(request);

  // Jika input adalah batch (array)
  if (Array.isArray(validatedRequest)) {
    // Ambil semua kanjiIds unik dari seluruh batch untuk validasi sekaligus
    const allKanjiIds = validatedRequest.flatMap((item) => item.kanjiIds);
    await validateKanjiExistence(allKanjiIds);

    const result = await prisma.$transaction(async (tx) => {
      let count = 0;
      for (const item of validatedRequest) {
        // Cek duplikat untuk tiap item dalam batch
        const existing = await tx.kotoba.count({
          where: {
            word: item.word,
            reading: item.reading,
          },
        });

        if (existing > 0) {
          throw new ResponseError(400, `Kosakata '${item.word}' sudah terdaftar`);
        }

        await tx.kotoba.create({
          data: {
            word: item.word,
            reading: item.reading,
            meaning: item.meaning,
            jlptLevel: item.jlptLevel,
            kanjiKotoba: {
              create: item.kanjiIds.map((kanjiId) => ({
                kanjiId: kanjiId,
              })),
            },
          },
        });
        count++;
      }
      return { count };
    });
    return result;
  }

  // Jika input adalah single object, validasi kanjiIds dan duplikat
  await validateKanjiExistence(validatedRequest.kanjiIds);
  await validateDuplicateKotoba(validatedRequest.word, validatedRequest.reading);

  const result = await prisma.kotoba.create({
    data: {
      word: validatedRequest.word,
      reading: validatedRequest.reading,
      meaning: validatedRequest.meaning,
      jlptLevel: validatedRequest.jlptLevel,
      kanjiKotoba: {
        create: validatedRequest.kanjiIds.map((kanjiId) => ({
          kanjiId: kanjiId,
        })),
      },
    },
    select: {
      id: true,
      word: true,
      reading: true,
      meaning: true,
      jlptLevel: true,
      kanjiKotoba: {
        select: {
          kanjiId: true,
        },
      },
    },
  });

  // Transform output agar sesuai dengan spesifikasi (kanjiIds sebagai array of strings)
  return {
    ...result,
    kanjiIds: result.kanjiKotoba.map((k) => k.kanjiId),
    kanjiKotoba: undefined, // Hapus internal structure prisma
  };
};

export { create };
