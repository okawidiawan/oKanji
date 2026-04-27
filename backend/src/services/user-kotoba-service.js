import { prisma } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import { getUserKotobaValidation } from "../validation/user-kotoba-validation.js";

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

export {
    add
};
