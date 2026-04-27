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
        upsert: mock()
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
});
