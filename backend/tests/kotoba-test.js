import { describe, it, expect, beforeEach, mock } from "bun:test";
import request from "supertest";

const prismaMock = {
    user: {
        findUnique: mock()
    },
    kanji: {
        count: mock()
    },
    kotoba: {
        create: mock()
    },
    $transaction: mock()
};

mock.module("../src/application/database.js", () => {
    return { prisma: prismaMock };
});

import { app } from "../src/application/web.js";

describe("Kotoba API", () => {
    beforeEach(() => {
        prismaMock.user.findUnique.mockReset();
        prismaMock.kotoba.create.mockReset();
        prismaMock.kanji.count.mockReset();
        prismaMock.$transaction.mockReset();
    });

    const mockAuthSuccess = () => {
        prismaMock.user.findUnique.mockResolvedValue({
            id: 1,
            username: "TestUser",
            email: "test@example.com",
            token: "valid-token"
        });
    };

    describe("POST /api/kotoba", () => {
        it("seharusnya berhasil membuat kotoba tunggal", async () => {
            mockAuthSuccess();
            const payload = {
                word: "食べる",
                reading: "たべる",
                meaning: "makan",
                jlptLevel: "N5",
                kanjiIds: ["550e8400-e29b-41d4-a716-446655440000"]
            };

            const mockCreated = {
                id: "kotoba-uuid-1",
                word: "食べる",
                reading: "たべる",
                meaning: "makan",
                jlptLevel: "N5",
                kanjiKotoba: [
                    { kanjiId: "550e8400-e29b-41d4-a716-446655440000" }
                ]
            };

            prismaMock.kanji.count.mockResolvedValue(1);
            prismaMock.kotoba.create.mockResolvedValue(mockCreated);

            const response = await request(app)
                .post("/api/kotoba")
                .set("Authorization", "Bearer valid-token")
                .send(payload);

            expect(response.status).toBe(200);
            expect(response.body.data.id).toBe("kotoba-uuid-1");
            expect(response.body.data.kanjiIds).toEqual(["550e8400-e29b-41d4-a716-446655440000"]);
            expect(prismaMock.kotoba.create).toHaveBeenCalled();
        });

        it("seharusnya berhasil membuat kotoba secara batch", async () => {
            mockAuthSuccess();
            const payload = [
                { word: "食べる", reading: "たべる", meaning: "makan", kanjiIds: ["550e8400-e29b-41d4-a716-446655440000"] },
                { word: "食事", reading: "しょくじ", meaning: "makan (formal)", kanjiIds: ["550e8400-e29b-41d4-a716-446655440000"] }
            ];

            prismaMock.kanji.count.mockResolvedValue(1);
            prismaMock.$transaction.mockImplementation(async (callback) => {
                return await callback(prismaMock);
            });
            prismaMock.kotoba.create.mockResolvedValue({});

            const response = await request(app)
                .post("/api/kotoba")
                .set("Authorization", "Bearer valid-token")
                .send(payload);

            expect(response.status).toBe(200);
            expect(response.body.data.count).toBe(2);
            expect(prismaMock.$transaction).toHaveBeenCalled();
            expect(prismaMock.kotoba.create).toHaveBeenCalledTimes(2);
        });

        it("seharusnya gagal (400) jika validasi input salah", async () => {
            mockAuthSuccess();
            const payload = {
                word: "", // Kosong, harusnya error
                reading: "たべる",
                meaning: "makan",
                kanjiIds: [] // Kosong, harusnya error
            };

            const response = await request(app)
                .post("/api/kotoba")
                .set("Authorization", "Bearer valid-token")
                .send(payload);

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("seharusnya gagal (401) jika tidak ada token", async () => {
            const response = await request(app)
                .post("/api/kotoba")
                .send({
                    word: "食べる",
                    reading: "たべる",
                    meaning: "makan",
                    kanjiIds: ["uuid"]
                });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe("Unauthorized");
        });

        it("seharusnya gagal (404) jika kanjiId tidak ditemukan di database", async () => {
            mockAuthSuccess();
            const payload = {
                word: "食べる",
                reading: "たべる",
                meaning: "makan",
                kanjiIds: ["550e8400-e29b-41d4-a716-446655440000"]
            };

            // Mock kembalikan 0 (artinya kanji tidak ditemukan)
            prismaMock.kanji.count.mockResolvedValue(0);

            const response = await request(app)
                .post("/api/kotoba")
                .set("Authorization", "Bearer valid-token")
                .send(payload);

            expect(response.status).toBe(404);
            expect(response.body.error).toBe("Kanji tidak ditemukan");
        });
    });
});
