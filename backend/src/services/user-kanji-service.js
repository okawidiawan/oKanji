import { prisma } from '../application/database.js';
import { ResponseError } from '../error/response-error.js';
import {
    addUserKanjiValidation,
    getUserKanjiValidation,
    listUserKanjiValidation
} from '../validation/user-kanji-validation.js';

/**
 * Membuat atau memperbarui progres belajar kanji milik user.
 * Menggunakan operasi upsert untuk menangani penambahan baru atau pembaruan.
 */
const add = async (user, request) => {
    // Validasi input data progres
    const validatedRequest = addUserKanjiValidation.parse(request);

    // Memastikan data kanji yang direferensikan memang ada di database
    const kanjiCount = await prisma.kanji.count({
        where: { id: validatedRequest.kanjiId }
    });
    if (kanjiCount === 0) {
        throw new ResponseError(404, "Kanji not found");
    }

    // Mencari apakah sudah ada progres sebelumnya untuk pasangan user dan kanji ini
    const existing = await prisma.userKanji.findUnique({
        where: {
            userId_kanjiId: {
                userId: user.id,
                kanjiId: validatedRequest.kanjiId
            }
        }
    });

    const now = new Date();
    let memorizedAt = existing?.memorizedAt;

    // Logika penentuan tanggal hafal: diatur saat pertama kali ditandai sebagai 'memorized'
    // Karena sekarang di-hardcode menjadi true, maka set memorizedAt jika sebelumnya belum memorized
    if (!existing?.isMemorized) {
        memorizedAt = now;
    }

    // Melakukan operasi upsert (update if exists, create if not)
    return prisma.userKanji.upsert({
        where: {
            userId_kanjiId: {
                userId: user.id,
                kanjiId: validatedRequest.kanjiId
            }
        },
        update: {
            isMemorized: true, // Hardcoded to true
            difficulty: validatedRequest.difficulty ?? existing?.difficulty,
            note: validatedRequest.note ?? existing?.note,
            reviewCount: { increment: 1 },
            lastReviewed: now,
            memorizedAt: memorizedAt
        },
        create: {
            userId: user.id,
            kanjiId: validatedRequest.kanjiId,
            isMemorized: true, // Hardcoded to true
            difficulty: validatedRequest.difficulty,
            note: validatedRequest.note,
            reviewCount: 1,
            lastReviewed: now,
            memorizedAt: now
        }
    });
};

/**
 * Mengambil data detail progres belajar kanji tertentu milik user.
 * Menyertakan informasi detail kanji dari tabel Kanji.
 */
const get = async (user, kanjiId) => {
    // Validasi format ID kanji
    const validatedKanjiId = getUserKanjiValidation.parse(kanjiId);

    const userKanji = await prisma.userKanji.findUnique({
        where: {
            userId_kanjiId: {
                userId: user.id,
                kanjiId: validatedKanjiId
            }
        },
        include: {
            kanji: true // Join dengan tabel kanji
        }
    });

    // Jika data progres belum ada, kembalikan 404
    if (!userKanji) {
        throw new ResponseError(404, "User progress for this kanji not found");
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
                kanji: true
            },
            orderBy: {
                updatedAt: 'desc'
            }
        }),
        prisma.userKanji.count({
            where: filters
        })
    ]);

    return {
        data,
        paging: {
            page: validatedRequest.page,
            total_item: total,
            total_page: Math.ceil(total / validatedRequest.size)
        }
    };
};

export { add, get, list };
