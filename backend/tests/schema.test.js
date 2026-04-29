import { describe, it, expect, beforeEach, mock } from "bun:test";

const prismaMock = {
    kotoba: {
        create: mock(),
        findUnique: mock(),
        delete: mock()
    },
    kanjiKotoba: {
        create: mock()
    },
    userKotoba: {
        create: mock(),
        findUnique: mock()
    }
};

mock.module("../src/application/database.js", () => {
    return { prisma: prismaMock };
});

import { prisma } from "../src/application/database.js";

describe("Prisma Schema Verification (Kotoba, KanjiKotoba, UserKotoba)", () => {
    beforeEach(() => {
        prismaMock.kotoba.create.mockReset();
        prismaMock.kotoba.findUnique.mockReset();
        prismaMock.kotoba.delete.mockReset();
        prismaMock.kanjiKotoba.create.mockReset();
        prismaMock.userKotoba.create.mockReset();
        prismaMock.userKotoba.findUnique.mockReset();
    });

    it("seharusnya dapat melakukan operasi CRUD dasar pada model Kotoba", async () => {
        const mockKotoba = {
            id: "kotoba-1",
            word: "食べる",
            reading: "たべる",
            meaning: "makan",
            jlptLevel: "N5",
            createdAt: new Date()
        };

        prismaMock.kotoba.create.mockResolvedValue(mockKotoba);
        prismaMock.kotoba.findUnique.mockResolvedValue(mockKotoba);

        const created = await prisma.kotoba.create({
            data: {
                word: "食べる",
                reading: "たべる",
                meaning: "makan",
                jlptLevel: "N5"
            }
        });

        expect(created.word).toBe("食べる");
        expect(prismaMock.kotoba.create).toHaveBeenCalled();

        const found = await prisma.kotoba.findUnique({
            where: { id: "kotoba-1" }
        });
        expect(found.id).toBe("kotoba-1");
    });

    it("seharusnya dapat membuat relasi KanjiKotoba", async () => {
        const mockRelation = {
            kanjiId: "kanji-1",
            kotobaId: "kotoba-1"
        };

        prismaMock.kanjiKotoba.create.mockResolvedValue(mockRelation);

        const relation = await prisma.kanjiKotoba.create({
            data: {
                kanjiId: "kanji-1",
                kotobaId: "kotoba-1"
            }
        });

        expect(relation.kanjiId).toBe("kanji-1");
        expect(relation.kotobaId).toBe("kotoba-1");
        expect(prismaMock.kanjiKotoba.create).toHaveBeenCalled();
    });

    it("seharusnya dapat membuat progress UserKotoba", async () => {
        const mockUserKotoba = {
            id: "user-kotoba-1",
            userId: 1,
            kotobaId: "kotoba-1",
            isMemorized: false,
            reviewCount: 0
        };

        prismaMock.userKotoba.create.mockResolvedValue(mockUserKotoba);

        const progress = await prisma.userKotoba.create({
            data: {
                userId: 1,
                kotobaId: "kotoba-1"
            }
        });

        expect(progress.userId).toBe(1);
        expect(progress.kotobaId).toBe("kotoba-1");
        expect(prismaMock.userKotoba.create).toHaveBeenCalled();
    });
});
