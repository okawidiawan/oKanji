import { describe, it, expect, beforeEach, mock } from "bun:test";
import request from "supertest";

/**
 * Mocking prisma client untuk unit testing.
 */
const prismaMock = {
    user: {
        findUnique: mock()
    },
    kotoba: {
        count: mock()
    },
    userKotoba: {
        upsert: mock(),
        findUnique: mock(),
        update: mock(),
        delete: mock()
    }
};

// Mocking module database
mock.module("../src/application/database.js", () => {
    return { prisma: prismaMock };
});

import { app } from "../src/application/web.js";

describe("User Kotoba API", () => {
    beforeEach(() => {
        // Reset semua mock sebelum setiap test case
        prismaMock.user.findUnique.mockReset();
        prismaMock.kotoba.count.mockReset();
        prismaMock.userKotoba.upsert.mockReset();
        prismaMock.userKotoba.findUnique.mockReset();
        prismaMock.userKotoba.update.mockReset();
        prismaMock.userKotoba.delete.mockReset();
    });

    /**
     * Helper untuk mensimulasikan login user yang valid.
     */
    const mockAuthSuccess = () => {
        prismaMock.user.findUnique.mockResolvedValue({
            id: 1, // ID user dummy (integer sesuai schema)
            username: "TestUser",
            email: "test@example.com",
            token: "valid-token"
        });
    };

    describe("POST /api/user-kotoba/:kotobaId (Add/Review Progress)", () => {
        it("seharusnya ditolak (401) jika tidak mengirim token", async () => {
            const response = await request(app).post("/api/user-kotoba/123e4567-e89b-12d3-a456-426614174001");
            expect(response.status).toBe(401);
            expect(response.body.error).toBe("Unauthorized");
        });

        it("seharusnya berhasil menambah hafalan kotoba baru", async () => {
            mockAuthSuccess();
            
            const kotobaId = "123e4567-e89b-12d3-a456-426614174001";
            // Mock pengecekan keberadaan kotoba
            prismaMock.kotoba.count.mockResolvedValue(1);
            // Mock hasil upsert
            prismaMock.userKotoba.upsert.mockResolvedValue({
                id: "progress-1",
                userId: 1,
                kotobaId: kotobaId,
                isMemorized: false,
                reviewCount: 1,
                lastReviewed: new Date()
            });

            const response = await request(app)
                .post(`/api/user-kotoba/${kotobaId}`)
                .set("Authorization", "Bearer valid-token");

            expect(response.status).toBe(200);
            expect(response.body.data.kotobaId).toBe(kotobaId);
            expect(response.body.data.reviewCount).toBe(1);
            expect(prismaMock.userKotoba.upsert).toHaveBeenCalled();
        });

        it("seharusnya berhasil mengupdate review count jika sudah ada", async () => {
            mockAuthSuccess();
            
            const kotobaId = "123e4567-e89b-12d3-a456-426614174002";
            prismaMock.kotoba.count.mockResolvedValue(1);
            prismaMock.userKotoba.upsert.mockResolvedValue({
                id: "progress-2",
                userId: 1,
                kotobaId: kotobaId,
                reviewCount: 2,
                lastReviewed: new Date()
            });

            const response = await request(app)
                .post(`/api/user-kotoba/${kotobaId}`)
                .set("Authorization", "Bearer valid-token");

            expect(response.status).toBe(200);
            expect(response.body.data.reviewCount).toBe(2);
        });

        it("seharusnya gagal (404) jika kotoba tidak ditemukan", async () => {
            mockAuthSuccess();
            
            prismaMock.kotoba.count.mockResolvedValue(0);

            const response = await request(app)
                .post("/api/user-kotoba/123e4567-e89b-12d3-a456-426614174999")
                .set("Authorization", "Bearer valid-token");

            expect(response.status).toBe(404);
            expect(response.body.error).toBe("Kotoba tidak ditemukan");
        });

        it("seharusnya gagal (400) jika kotobaId bukan UUID", async () => {
            mockAuthSuccess();
            
            const response = await request(app)
                .post("/api/user-kotoba/invalid-id")
                .set("Authorization", "Bearer valid-token");

            expect(response.status).toBe(400);
            expect(response.body.error).toBe("Validation Error");
            expect(response.body.details[0].message).toBe("Format ID Kotoba tidak valid");
        });
    });

    describe("PATCH /api/user-kotoba/:kotobaId (Update Progress)", () => {
        it("seharusnya ditolak (401) jika tidak mengirim token", async () => {
            const response = await request(app).patch("/api/user-kotoba/123e4567-e89b-12d3-a456-426614174001");
            expect(response.status).toBe(401);
            expect(response.body.error).toBe("Unauthorized");
        });

        it("seharusnya berhasil update data progres kotoba", async () => {
            mockAuthSuccess();
            const kotobaId = "123e4567-e89b-12d3-a456-426614174001";

            // Mock progres yang ada
            prismaMock.userKotoba.findUnique.mockResolvedValue({
                id: "progress-1",
                userId: 1,
                kotobaId: kotobaId,
                isMemorized: false,
                difficulty: null,
                note: null,
                memorizedAt: null
            });

            // Mock hasil update
            prismaMock.userKotoba.update.mockResolvedValue({
                id: "progress-1",
                userId: 1,
                kotobaId: kotobaId,
                isMemorized: true,
                difficulty: 5,
                note: "Test note",
                reviewCount: 2,
                memorizedAt: new Date()
            });

            const response = await request(app)
                .patch(`/api/user-kotoba/${kotobaId}`)
                .set("Authorization", "Bearer valid-token")
                .send({
                    isMemorized: true,
                    difficulty: 5,
                    note: "Test note"
                });

            expect(response.status).toBe(200);
            expect(response.body.data.isMemorized).toBe(true);
            expect(response.body.data.difficulty).toBe(5);
            expect(response.body.data.note).toBe("Test note");
            expect(prismaMock.userKotoba.update).toHaveBeenCalled();
        });

        it("seharusnya gagal (404) jika data progres belum ada", async () => {
            mockAuthSuccess();
            const kotobaId = "123e4567-e89b-12d3-a456-426614174999";

            prismaMock.userKotoba.findUnique.mockResolvedValue(null);

            const response = await request(app)
                .patch(`/api/user-kotoba/${kotobaId}`)
                .set("Authorization", "Bearer valid-token")
                .send({ isMemorized: true });

            expect(response.status).toBe(404);
            expect(response.body.error).toBe("Data Progress Kotoba Tidak Ditemukan");
        });

        it("seharusnya gagal (400) jika body request tidak valid", async () => {
            mockAuthSuccess();
            const kotobaId = "123e4567-e89b-12d3-a456-426614174001";

            const response = await request(app)
                .patch(`/api/user-kotoba/${kotobaId}`)
                .set("Authorization", "Bearer valid-token")
                .send({ difficulty: 10 }); // Difficulty max 5

            expect(response.status).toBe(400);
            expect(response.body.error).toBe("Validation Error");
        });

        it("seharusnya gagal (400) jika body request kosong", async () => {
            mockAuthSuccess();
            const kotobaId = "123e4567-e89b-12d3-a456-426614174001";

            const response = await request(app)
                .patch(`/api/user-kotoba/${kotobaId}`)
                .set("Authorization", "Bearer valid-token")
                .send({}); // Minimal satu field harus diisi

            expect(response.status).toBe(400);
            expect(response.body.error).toBe("Validation Error");
            expect(response.body.details[0].message).toBe("Minimal satu field harus diisi (isMemorized, difficulty, atau note)");
        });
    });

    describe("DELETE /api/user-kotoba/:kotobaId (Remove Progress)", () => {
        it("seharusnya ditolak (401) jika tidak mengirim token", async () => {
            const response = await request(app).delete("/api/user-kotoba/123e4567-e89b-12d3-a456-426614174001");
            expect(response.status).toBe(401);
            expect(response.body.error).toBe("Unauthorized");
        });

        it("seharusnya berhasil menghapus progres kotoba", async () => {
            mockAuthSuccess();
            const kotobaId = "123e4567-e89b-12d3-a456-426614174001";

            // Mock data ada
            prismaMock.userKotoba.findUnique.mockResolvedValue({
                id: "progress-1",
                userId: 1,
                kotobaId: kotobaId
            });

            // Mock hasil delete
            prismaMock.userKotoba.delete.mockResolvedValue({ id: "progress-1" });

            const response = await request(app)
                .delete(`/api/user-kotoba/${kotobaId}`)
                .set("Authorization", "Bearer valid-token");

            expect(response.status).toBe(200);
            expect(response.body.data).toBe("OK");
            expect(prismaMock.userKotoba.delete).toHaveBeenCalledWith({
                where: {
                    userId_kotobaId: {
                        userId: 1,
                        kotobaId: kotobaId
                    }
                }
            });
        });

        it("seharusnya gagal (404) jika data progres tidak ditemukan", async () => {
            mockAuthSuccess();
            const kotobaId = "123e4567-e89b-12d3-a456-426614174999";

            prismaMock.userKotoba.findUnique.mockResolvedValue(null);

            const response = await request(app)
                .delete(`/api/user-kotoba/${kotobaId}`)
                .set("Authorization", "Bearer valid-token");

            expect(response.status).toBe(404);
            expect(response.body.error).toBe("Data Progress Kotoba Tidak Ditemukan");
        });

        it("seharusnya gagal (400) jika kotobaId bukan UUID", async () => {
            mockAuthSuccess();
            
            const response = await request(app)
                .delete("/api/user-kotoba/invalid-id")
                .set("Authorization", "Bearer valid-token");

            expect(response.status).toBe(400);
            expect(response.body.error).toBe("Validation Error");
            expect(response.body.details[0].message).toBe("Format ID Kotoba tidak valid");
        });

        it("seharusnya gagal (404) jika mencoba menghapus progres milik user lain (Data Isolation)", async () => {
            mockAuthSuccess(); // User 1
            const kotobaId = "123e4567-e89b-12d3-a456-426614174001";

            // Mock findUnique mengembalikan null karena user id tidak match (Data Isolation logic di service)
            prismaMock.userKotoba.findUnique.mockResolvedValue(null);

            const response = await request(app)
                .delete(`/api/user-kotoba/${kotobaId}`)
                .set("Authorization", "Bearer valid-token");

            expect(response.status).toBe(404);
            expect(response.body.error).toBe("Data Progress Kotoba Tidak Ditemukan");
        });
    });
});
