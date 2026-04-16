import { prisma } from '../application/database.js';
import { ResponseError } from '../error/response-error.js';
import {
    createOrUpdateUserKanjiValidation,
    getUserKanjiValidation,
    listUserKanjiValidation
} from '../validation/user-kanji-validation.js';

const upsert = async (user, request) => {
    const validatedRequest = createOrUpdateUserKanjiValidation.parse(request);

    // Verify kanji exists
    const kanjiCount = await prisma.kanji.count({
        where: { id: validatedRequest.kanjiId }
    });
    if (kanjiCount === 0) {
        throw new ResponseError(404, "Kanji not found");
    }

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

    // Set memorizedAt if first time marked as memorized
    if (validatedRequest.isMemorized === true && !existing?.isMemorized) {
        memorizedAt = now;
    }

    return prisma.userKanji.upsert({
        where: {
            userId_kanjiId: {
                userId: user.id,
                kanjiId: validatedRequest.kanjiId
            }
        },
        update: {
            isMemorized: validatedRequest.isMemorized ?? existing?.isMemorized,
            difficulty: validatedRequest.difficulty ?? existing?.difficulty,
            note: validatedRequest.note ?? existing?.note,
            reviewCount: { increment: 1 },
            lastReviewed: now,
            memorizedAt: memorizedAt
        },
        create: {
            userId: user.id,
            kanjiId: validatedRequest.kanjiId,
            isMemorized: validatedRequest.isMemorized || false,
            difficulty: validatedRequest.difficulty,
            note: validatedRequest.note,
            reviewCount: 1,
            lastReviewed: now,
            memorizedAt: validatedRequest.isMemorized ? now : null
        }
    });
};

const get = async (user, kanjiId) => {
    const validatedKanjiId = getUserKanjiValidation.parse(kanjiId);

    const userKanji = await prisma.userKanji.findUnique({
        where: {
            userId_kanjiId: {
                userId: user.id,
                kanjiId: validatedKanjiId
            }
        },
        include: {
            kanji: true
        }
    });

    if (!userKanji) {
        throw new ResponseError(404, "User progress for this kanji not found");
    }

    return userKanji;
};

const list = async (user, request) => {
    const validatedRequest = listUserKanjiValidation.parse(request);
    const skip = (validatedRequest.page - 1) * validatedRequest.size;

    const filters = {
        userId: user.id,
    };

    if (validatedRequest.isMemorized !== undefined) {
        filters.isMemorized = validatedRequest.isMemorized;
    }

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

export { upsert, get, list };
