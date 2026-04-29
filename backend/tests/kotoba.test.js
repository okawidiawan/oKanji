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
        findUnique: mock(),
        create: mock(),
        update: mock(),
        delete: mock(),
        count: mock()
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
        prismaMock.kotoba.findUnique.mockReset();
        prismaMock.kotoba.create.mockReset();
        prismaMock.kotoba.update.mockReset();
        prismaMock.kotoba.delete.mockReset();
        prismaMock.kotoba.count.mockReset();
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

            expect(response.status).toBe(201);
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

            expect(response.status).toBe(201);
            expect(response.body.data.count).toBe(2);
            expect(prismaMock.$transaction).toHaveBeenCalled();
            expect(prismaMock.kotoba.create).toHaveBeenCalledTimes(2);
        });

        it("seharusnya gagal (400) jika ada item duplikat dalam satu batch", async () => {
            mockAuthSuccess();
            const payload = [
                { word: "食べる", reading: "たべる", meaning: "makan", kanjiIds: ["550e8400-e29b-41d4-a716-446655440000"] },
                { word: "食べる", reading: "たべる", meaning: "makan lagi", kanjiIds: ["550e8400-e29b-41d4-a716-446655440000"] }
            ];

            prismaMock.kanji.count.mockResolvedValue(1);
            prismaMock.$transaction.mockImplementation(async (callback) => {
                return await callback(prismaMock);
            });
            
            // Mock findFirst/count to return 1 for the second item
            prismaMock.kotoba.count.mockResolvedValueOnce(0).mockResolvedValueOnce(1);

            const response = await request(app)
                .post("/api/kotoba")
                .set("Authorization", "Bearer valid-token")
                .send(payload);

            expect(response.status).toBe(400);
            expect(response.body.error).toContain("sudah terdaftar");
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

        it("seharusnya gagal (400) jika format kanjiId bukan UUID", async () => {
            mockAuthSuccess();
            const payload = {
                word: "食べる",
                reading: "たべる",
                meaning: "makan",
                kanjiIds: ["bukan-uuid"]
            };

            const response = await request(app)
                .post("/api/kotoba")
                .set("Authorization", "Bearer valid-token")
                .send(payload);

            expect(response.status).toBe(400);
            expect(response.body.error).toBe("Validation Error");
        });
    });

    describe("PATCH /api/kotoba/:kotobaId", () => {
        const kotobaId = "550e8400-e29b-41d4-a716-446655440000";

        it("seharusnya berhasil memperbarui kotoba", async () => {
            mockAuthSuccess();
            const payload = {
                word: "飲む",
                meaning: "Minum"
            };

            prismaMock.kotoba.findUnique.mockResolvedValue({
                id: kotobaId,
                word: "食べる",
                reading: "たべる",
                meaning: "Makan",
                jlptLevel: "N5"
            });

            prismaMock.kotoba.count.mockResolvedValue(0); // Tidak ada duplikat

            prismaMock.kotoba.update.mockResolvedValue({
                id: kotobaId,
                word: "飲む",
                reading: "たべる",
                meaning: "Minum",
                jlptLevel: "N5"
            });

            const response = await request(app)
                .patch(`/api/kotoba/${kotobaId}`)
                .set("Authorization", "Bearer valid-token")
                .send(payload);

            expect(response.status).toBe(200);
            expect(response.body.data.word).toBe("飲む");
            expect(response.body.data.meaning).toBe("Minum");
            expect(prismaMock.kotoba.update).toHaveBeenCalled();
        });

        it("seharusnya gagal (404) jika kotoba tidak ditemukan", async () => {
            mockAuthSuccess();
            prismaMock.kotoba.findUnique.mockResolvedValue(null);

            const response = await request(app)
                .patch(`/api/kotoba/${kotobaId}`)
                .set("Authorization", "Bearer valid-token")
                .send({ word: "Test" });

            expect(response.status).toBe(404);
            expect(response.body.error).toBe("Kotoba tidak ditemukan");
        });

        it("seharusnya gagal (400) jika format ID bukan UUID", async () => {
            mockAuthSuccess();
            const response = await request(app)
                .patch("/api/kotoba/bukan-uuid")
                .set("Authorization", "Bearer valid-token")
                .send({ word: "Test" });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe("Validation Error");
        });

        it("seharusnya gagal (400) jika terjadi duplikat word dan reading", async () => {
            mockAuthSuccess();
            const payload = {
                word: "食べる",
                reading: "たべる"
            };

            prismaMock.kotoba.findUnique.mockResolvedValue({
                id: kotobaId,
                word: "Lama",
                reading: "Lama"
            });

            prismaMock.kotoba.count.mockResolvedValue(1); // Duplikat ditemukan

            const response = await request(app)
                .patch(`/api/kotoba/${kotobaId}`)
                .set("Authorization", "Bearer valid-token")
                .send(payload);

            expect(response.status).toBe(400);
            expect(response.body.error).toBe("Kosakata sudah terdaftar");
        });

        it("seharusnya gagal (401) jika tidak ada token", async () => {
            const response = await request(app)
                .patch(`/api/kotoba/${kotobaId}`)
                .send({ word: "Test" });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe("Unauthorized");
        });

        it("seharusnya gagal (400) jika mengirim body kosong", async () => {
            mockAuthSuccess();
            const response = await request(app)
                .patch(`/api/kotoba/${kotobaId}`)
                .set("Authorization", "Bearer valid-token")
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.error).toBe("Validation Error");
            expect(response.body.details[0].message).toBe("Setidaknya satu field harus diisi");
        });
    });

    describe("DELETE /api/kotoba/:kotobaId", () => {
        const kotobaId = "550e8400-e29b-41d4-a716-446655440000";

        it("seharusnya berhasil menghapus kotoba", async () => {
            mockAuthSuccess();

            prismaMock.kotoba.findUnique.mockResolvedValue({
                id: kotobaId,
                word: "食べる"
            });

            prismaMock.kotoba.delete.mockResolvedValue({ id: kotobaId });

            const response = await request(app)
                .delete(`/api/kotoba/${kotobaId}`)
                .set("Authorization", "Bearer valid-token");

            expect(response.status).toBe(200);
            expect(response.body.data).toBe("OK");
            expect(prismaMock.kotoba.delete).toHaveBeenCalledWith({
                where: { id: kotobaId }
            });
        });

        it("seharusnya gagal (404) jika kotoba tidak ditemukan", async () => {
            mockAuthSuccess();
            prismaMock.kotoba.findUnique.mockResolvedValue(null);

            const response = await request(app)
                .delete(`/api/kotoba/${kotobaId}`)
                .set("Authorization", "Bearer valid-token");

            expect(response.status).toBe(404);
            expect(response.body.error).toBe("Kotoba tidak ditemukan");
        });

        it("seharusnya gagal (400) jika format ID bukan UUID", async () => {
            mockAuthSuccess();
            const response = await request(app)
                .delete("/api/kotoba/bukan-uuid")
                .set("Authorization", "Bearer valid-token");

            expect(response.status).toBe(400);
            expect(response.body.error).toBe("Validation Error");
        });

        it("seharusnya gagal (401) jika tidak ada token", async () => {
            const response = await request(app)
                .delete(`/api/kotoba/${kotobaId}`);

            expect(response.status).toBe(401);
            expect(response.body.error).toBe("Unauthorized");
        });
    });
});
