import { prisma } from '../application/database.js';
import { postKotobaValidation } from '../validation/kotoba-validation.js';
import { ResponseError } from '../error/response-error.js';

/**
 * Memastikan semua kanjiId yang dikirimkan ada di database.
 * @param {string[]} kanjiIds 
 */
const validateKanjiExistence = async (kanjiIds) => {
  const uniqueKanjiIds = [...new Set(kanjiIds)];
  const count = await prisma.kanji.count({
    where: {
      id: { in: uniqueKanjiIds }
    }
  });

  if (count !== uniqueKanjiIds.length) {
    throw new ResponseError(404, "Kanji tidak ditemukan");
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
    const allKanjiIds = validatedRequest.flatMap(item => item.kanjiIds);
    await validateKanjiExistence(allKanjiIds);

    const result = await prisma.$transaction(async (tx) => {
      let count = 0;
      for (const item of validatedRequest) {
        await tx.kotoba.create({
          data: {
            word: item.word,
            reading: item.reading,
            meaning: item.meaning,
            jlptLevel: item.jlptLevel,
            kanjiKotoba: {
              create: item.kanjiIds.map((kanjiId) => ({
                kanjiId: kanjiId
              }))
            }
          }
        });
        count++;
      }
      return { count };
    });
    return result;
  }

  // Jika input adalah single object, validasi kanjiIds
  await validateKanjiExistence(validatedRequest.kanjiIds);

  const result = await prisma.kotoba.create({
    data: {
      word: validatedRequest.word,
      reading: validatedRequest.reading,
      meaning: validatedRequest.meaning,
      jlptLevel: validatedRequest.jlptLevel,
      kanjiKotoba: {
        create: validatedRequest.kanjiIds.map((kanjiId) => ({
          kanjiId: kanjiId
        }))
      }
    },
    select: {
      id: true,
      word: true,
      reading: true,
      meaning: true,
      jlptLevel: true,
      kanjiKotoba: {
        select: {
          kanjiId: true
        }
      }
    }
  });

  // Transform output agar sesuai dengan spesifikasi (kanjiIds sebagai array of strings)
  return {
    ...result,
    kanjiIds: result.kanjiKotoba.map(k => k.kanjiId),
    kanjiKotoba: undefined // Hapus internal structure prisma
  };
};

export { create };
