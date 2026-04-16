const { z } = require('zod');

const createOrUpdateUserKanjiValidation = z.object({
    kanjiId: z.string().uuid(),
    isMemorized: z.boolean().optional(),
    difficulty: z.number().min(1).max(5).optional(),
    note: z.string().optional(),
});

const getUserKanjiValidation = z.string().uuid();

const listUserKanjiValidation = z.object({
    page: z.coerce.number().min(1).default(1),
    size: z.coerce.number().min(1).max(100).default(10),
    isMemorized: z.coerce.boolean().optional(),
});

module.exports = {
    createOrUpdateUserKanjiValidation,
    getUserKanjiValidation,
    listUserKanjiValidation
};
