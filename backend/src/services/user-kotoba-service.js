import { prisma } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import { updateUserKotobaValidation, getUserKotobaValidation } from "../validation/user-kotoba-validation.js";

/**
 * Membuat atau memperbarui progres belajar kotoba milik user.
 * Menggunakan operasi upsert untuk menangani penambahan baru atau pembaruan review.
 */
const add = async (user, kotobaId) => {
    // Validasi format ID kotoba
    const validatedKotobaId = getUserKotobaValidation.parse(kotobaId);

    // Memastikan data kotoba yang direferensikan memang ada di database
    const kotobaCount = await prisma.kotoba.count({
        where: { id: validatedKotobaId },
    });

    if (kotobaCount === 0) {
        throw new ResponseError(404, "Kotoba tidak ditemukan");
    }

    const now = new Date();

    // Melakukan operasi upsert (update jika sudah ada, create jika belum)
    return prisma.userKotoba.upsert({
        where: {
            userId_kotobaId: {
                userId: user.id,
                kotobaId: validatedKotobaId,
            },
        },
        update: {
            reviewCount: { increment: 1 },
            lastReviewed: now,
        },
        create: {
            userId: user.id,
            kotobaId: validatedKotobaId,
            isMemorized: false,
            reviewCount: 1,
            lastReviewed: now,
            memorizedAt: null,
        },
    });
};

/**
 * Memperbarui progres belajar kotoba milik user secara parsial.
 * Menjamin keamanan data (Data Isolation) melalui pengecekan kepemilikan.
 */
const update = async (user, request) => {
    // Validasi input pembaruan
    const validatedRequest = updateUserKotobaValidation.parse(request);

    // Mencari data progres yang ada untuk memastikan kepemilikan (Data Isolation)
    const existing = await prisma.userKotoba.findUnique({
        where: {
            userId_kotobaId: {
                userId: user.id,
                kotobaId: validatedRequest.kotobaId,
            },
        },
    });

    // Jika data tidak ditemukan, lempar 404
    if (!existing) {
        throw new ResponseError(404, "Data Progress Kotoba Tidak Ditemukan");
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
    return prisma.userKotoba.update({
        where: {
            userId_kotobaId: {
                userId: user.id,
                kotobaId: validatedRequest.kotobaId,
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

/**
 * Menghapus progres belajar kotoba milik user.
 * Menjamin keamanan data (Data Isolation) melalui pengecekan kepemilikan.
 */
const remove = async (user, kotobaId) => {
    // Validasi format ID kotoba
    const validatedKotobaId = getUserKotobaValidation.parse(kotobaId);

    // Mencari data progres yang ada untuk memastikan kepemilikan (Data Isolation)
    const existing = await prisma.userKotoba.findUnique({
        where: {
            userId_kotobaId: {
                userId: user.id,
                kotobaId: validatedKotobaId,
            },
        },
    });

    // Jika data tidak ditemukan, lempar 404
    if (!existing) {
        throw new ResponseError(404, "Data Progress Kotoba Tidak Ditemukan");
    }

    // Menghapus data progres dari database
    return prisma.userKotoba.delete({
        where: {
            userId_kotobaId: {
                userId: user.id,
                kotobaId: validatedKotobaId,
            },
        },
    });
};

export {
    add,
    update,
    remove
};
