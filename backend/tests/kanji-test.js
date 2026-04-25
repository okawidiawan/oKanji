import { describe, it, expect, beforeEach, mock } from "bun:test";
import request from "supertest";

const prismaMock = {
    user: {
        findUnique: mock()
    },
    kanji: {
        findMany: mock(),
        count: mock(),
        findUnique: mock()
    }
};

mock.module("../src/application/database.js", () => {
    return { prisma: prismaMock };
});

import { app } from "../src/application/web.js";

describe("Kanji API", () => {
    beforeEach(() => {
        prismaMock.user.findUnique.mockReset();
        prismaMock.kanji.findMany.mockReset();
        prismaMock.kanji.count.mockReset();
        prismaMock.kanji.findUnique.mockReset();
    });

    const mockAuthSuccess = () => {
        prismaMock.user.findUnique.mockResolvedValue({
            id: "user-1",
            username: "TestUser",
            email: "test@example.com",
            token: "valid-token"
        });
    };

    describe("GET /api/kanjis", () => {
        it("seharusnya berhasil mengambil list kanji tanpa filter (default page 1, size 20)", async () => {
            mockAuthSuccess();
            const mockData = [
                { id: "1", character: "日", jlptLevel: "N5" },
                { id: "2", character: "月", jlptLevel: "N5" }
            ];

            prismaMock.kanji.findMany.mockResolvedValue(mockData);
            prismaMock.kanji.count.mockResolvedValue(2);

            const response = await request(app)
                .get("/api/kanjis")
                .set("Authorization", "Bearer valid-token");

            expect(response.status).toBe(200);
            expect(response.body.data).toEqual(mockData);
            expect(response.body.paging.page).toBe(1);
            expect(response.body.paging.total_item).toBe(2);
            expect(response.body.paging.total_page).toBe(1);

            expect(prismaMock.kanji.findMany).toHaveBeenCalledWith(expect.objectContaining({
                take: 20,
                skip: 0
            }));
        });

        it("seharusnya berhasil memfilter berdasarkan level JLPT", async () => {
            mockAuthSuccess();
            const mockData = [
                { id: "1", character: "日", jlptLevel: "N5" },
            ];

            prismaMock.kanji.findMany.mockResolvedValue(mockData);
            prismaMock.kanji.count.mockResolvedValue(1);

            const response = await request(app)
                .get("/api/kanjis?level=N5")
                .set("Authorization", "Bearer valid-token");

            expect(response.status).toBe(200);
            expect(response.body.data).toEqual(mockData);
            expect(prismaMock.kanji.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { jlptLevel: "N5" }
            }));
            expect(prismaMock.kanji.count).toHaveBeenCalledWith(expect.objectContaining({
                where: { jlptLevel: "N5" }
            }));
        });

        it("seharusnya berjalan dengan benar ketika menggunakan custom pagination", async () => {
             mockAuthSuccess();
             const mockData = [
                { id: "3", character: "木", jlptLevel: "N4" },
            ];

            prismaMock.kanji.findMany.mockResolvedValue(mockData);
            prismaMock.kanji.count.mockResolvedValue(15);

            const response = await request(app)
                .get("/api/kanjis?page=2&size=5")
                .set("Authorization", "Bearer valid-token");

            expect(response.status).toBe(200);
            expect(response.body.paging.page).toBe(2);
            expect(response.body.paging.total_item).toBe(15);
            expect(response.body.paging.total_page).toBe(3); 

            expect(prismaMock.kanji.findMany).toHaveBeenCalledWith(expect.objectContaining({
                take: 5,
                skip: 5
            }));
        });

        it("seharusnya berhasil mencari kanji berdasarkan karakter atau makna", async () => {
            mockAuthSuccess();
            const mockData = [
                { id: "1", character: "日", jlptLevel: "N5", meaning: "matahari, hari" },
            ];

            prismaMock.kanji.findMany.mockResolvedValue(mockData);
            prismaMock.kanji.count.mockResolvedValue(1);

            const response = await request(app)
                .get("/api/kanjis?search=日")
                .set("Authorization", "Bearer valid-token");

            expect(response.status).toBe(200);
            expect(response.body.data).toEqual(mockData);
            expect(prismaMock.kanji.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: {
                    OR: [
                        { character: { contains: "日" } },
                        { meaning: { contains: "日" } }
                    ]
                }
            }));
        });

        it("seharusnya ditolak atau default bila parameter paginasi tidak valid", async () => {
             mockAuthSuccess();
             const response = await request(app)
                .get("/api/kanjis?page=-1&size=999")
                .set("Authorization", "Bearer valid-token");
             
             expect(response.status).toBe(400);
             expect(response.body.error).toBeDefined();
        });

        it("seharusnya gagal (400) jika level tidak valid (misal N6)", async () => {
            mockAuthSuccess();
            const response = await request(app)
               .get("/api/kanjis?level=N6")
               .set("Authorization", "Bearer valid-token");
            
            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("seharusnya berhasil memfilter kombinasi level dan search secara bersamaan", async () => {
            mockAuthSuccess();
            const mockData = [{ id: "1", character: "日", jlptLevel: "N5" }];
            prismaMock.kanji.findMany.mockResolvedValue(mockData);
            prismaMock.kanji.count.mockResolvedValue(1);

            const response = await request(app)
               .get("/api/kanjis?level=N5&search=日")
               .set("Authorization", "Bearer valid-token");

            expect(response.status).toBe(200);
            expect(prismaMock.kanji.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: {
                    jlptLevel: "N5",
                    OR: [
                        { character: { contains: "日" } },
                        { meaning: { contains: "日" } }
                    ]
                }
            }));
        });
    });

    describe("GET /api/kanjis/:kanjiId", () => {
        const kanjiId = "550e8400-e29b-41d4-a716-446655440000";

        it("seharusnya berhasil mengambil detail kanji beserta kotoba", async () => {
            mockAuthSuccess();
            const mockKanjiData = {
                id: kanjiId,
                character: "食",
                jlptLevel: "N5",
                onyomi: "ショク",
                kunyomi: "た.べる",
                meaning: "makan",
                kanjiKotoba: [
                    {
                        kotoba: {
                            id: "kotoba-1",
                            word: "食べる",
                            reading: "たべる",
                            meaning: "makan"
                        }
                    }
                ]
            };

            prismaMock.kanji.findUnique.mockResolvedValue(mockKanjiData);

            const response = await request(app)
                .get(`/api/kanjis/${kanjiId}`)
                .set("Authorization", "Bearer valid-token");

            expect(response.status).toBe(200);
            expect(response.body.data.character).toBe("食");
            expect(response.body.data.kotoba).toHaveLength(1);
            expect(response.body.data.kotoba[0].word).toBe("食べる");
            expect(response.body.data.kanjiKotoba).toBeUndefined();
            expect(prismaMock.kanji.findUnique).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: kanjiId },
                include: expect.objectContaining({
                    kanjiKotoba: expect.objectContaining({
                        include: { kotoba: true }
                    })
                })
            }));
        });

        it("seharusnya gagal (404) jika kanji tidak ditemukan", async () => {
            mockAuthSuccess();
            prismaMock.kanji.findUnique.mockResolvedValue(null);

            const response = await request(app)
                .get(`/api/kanjis/${kanjiId}`)
                .set("Authorization", "Bearer valid-token");

            expect(response.status).toBe(404);
            expect(response.body.error).toBe("Kanji tidak ditemukan");
        });

        it("seharusnya gagal (400) jika format kanjiId bukan UUID", async () => {
            mockAuthSuccess();
            const response = await request(app)
                .get("/api/kanjis/invalid-id")
                .set("Authorization", "Bearer valid-token");

            expect(response.status).toBe(400);
            expect(response.body.error).toBe("Validation Error");
            expect(response.body.details[0].message).toBe("Format Kanji ID tidak valid");
        });

        it("seharusnya gagal (401) jika tidak menyertakan token", async () => {
            const response = await request(app)
                .get(`/api/kanjis/${kanjiId}`);

            expect(response.status).toBe(401);
            expect(response.body.error).toBe("Unauthorized");
        });
    });
});
