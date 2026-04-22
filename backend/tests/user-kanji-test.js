import { describe, it, expect, beforeEach, mock } from "bun:test";
import request from "supertest";

const prismaMock = {
    user: {
        findUnique: mock()
    },
    kanji: {
        count: mock()
    },
    userKanji: {
        findUnique: mock(),
        upsert: mock(),
        findMany: mock(),
        count: mock(),
        delete: mock()
    }
};

mock.module("../src/application/database.js", () => {
    return { prisma: prismaMock };
});

import { app } from "../src/application/web.js";

describe("User Kanji API", () => {
    beforeEach(() => {
        prismaMock.user.findUnique.mockReset();
        prismaMock.kanji.count.mockReset();
        prismaMock.userKanji.findUnique.mockReset();
        prismaMock.userKanji.upsert.mockReset();
        prismaMock.userKanji.findMany.mockReset();
        prismaMock.userKanji.count.mockReset();
        prismaMock.userKanji.delete.mockReset();
    });

    const mockAuthSuccess = () => {
        prismaMock.user.findUnique.mockResolvedValue({
            id: "user-1",
            username: "TestUser",
            email: "test@example.com",
            token: "valid-token"
        });
    };

    describe("Authentication Requirement", () => {
        it("seharusnya ditolak (401) jika tidak mengirim token", async () => {
            const response = await request(app).get("/api/user-kanji");
            expect(response.status).toBe(401);
            expect(response.body.error).toBe("Unauthorized");
        });
        
        it("seharusnya ditolak (401) jika token tidak ditemukan di database", async () => {
            prismaMock.user.findUnique.mockResolvedValue(null);
            const response = await request(app)
                .get("/api/user-kanji")
                .set("Authorization", "Bearer invalid-token");

            expect(response.status).toBe(401);
            expect(response.body.error).toBe("Unauthorized");
        });
    });

    describe("GET /api/user-kanji/:kanjiId (Get Specific)", () => {
        it("seharusnya berhasil mengambil data hafalan kanji secara spesifik", async () => {
            mockAuthSuccess();
            const mockUserKanji = {
                userId: "user-1",
                kanjiId: "123e4567-e89b-12d3-a456-426614174001",
                isMemorized: true,
                kanji: { id: "123e4567-e89b-12d3-a456-426614174001", character: "日" }
            };

            prismaMock.userKanji.findUnique.mockResolvedValue(mockUserKanji);

            const response = await request(app)
                .get("/api/user-kanji/123e4567-e89b-12d3-a456-426614174001")
                .set("Authorization", "Bearer valid-token");

            expect(response.status).toBe(200);
            expect(response.body.data).toEqual(mockUserKanji);
            expect(prismaMock.userKanji.findUnique).toHaveBeenCalledWith(expect.objectContaining({
                where: { userId_kanjiId: { userId: "user-1", kanjiId: "123e4567-e89b-12d3-a456-426614174001" } }
            }));
        });

        it("seharusnya mengembalikan error 404 jika kanji belum pernah diinteraksi user", async () => {
            mockAuthSuccess();
            prismaMock.userKanji.findUnique.mockResolvedValue(null);

            const response = await request(app)
                .get("/api/user-kanji/123e4567-e89b-12d3-a456-426614174002")
                .set("Authorization", "Bearer valid-token");

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });
    });

    describe("POST /api/user-kanji/:kanjiId (Add Progress)", () => {
        it("seharusnya berhasil menambah hafalan kanji lewat url parameter tanpa body", async () => {
            mockAuthSuccess();
            
            prismaMock.kanji.count.mockResolvedValue(1);
            prismaMock.userKanji.findUnique.mockResolvedValue(null);
            prismaMock.userKanji.upsert.mockResolvedValue({
                userId: "user-1", kanjiId: "123e4567-e89b-12d3-a456-426614174003", isMemorized: true
            });

            const response = await request(app)
                .post("/api/user-kanji/123e4567-e89b-12d3-a456-426614174003")
                .set("Authorization", "Bearer valid-token")
                .send({}); // Body kosong

            expect(response.status).toBe(200);
            expect(response.body.data.isMemorized).toBe(true);
            expect(prismaMock.userKanji.upsert).toHaveBeenCalledWith(expect.objectContaining({
                 where: { userId_kanjiId: { userId: "user-1", kanjiId: "123e4567-e89b-12d3-a456-426614174003" } },
                 create: expect.objectContaining({ isMemorized: true })
            }));
        });

        it("seharusnya tetap berhasil mengupdate hafalan kanji jika sudah ada", async () => {
            mockAuthSuccess();
            prismaMock.kanji.count.mockResolvedValue(1);
            prismaMock.userKanji.findUnique.mockResolvedValue({ isMemorized: false }); 
            prismaMock.userKanji.upsert.mockResolvedValue({
                userId: "user-1", kanjiId: "123e4567-e89b-12d3-a456-426614174004", isMemorized: true
            });

            const response = await request(app)
                .post("/api/user-kanji/123e4567-e89b-12d3-a456-426614174004")
                .set("Authorization", "Bearer valid-token");

            expect(response.status).toBe(200);
            expect(response.body.data.kanjiId).toBe("123e4567-e89b-12d3-a456-426614174004");
            expect(response.body.data.isMemorized).toBe(true);
        });

        it("seharusnya gagal di-update (404) jika kanjinya fiktif/tidak ada", async () => {
            mockAuthSuccess();
            prismaMock.kanji.count.mockResolvedValue(0);

            const response = await request(app)
                .post("/api/user-kanji/123e4567-e89b-12d3-a456-426614174005")
                .set("Authorization", "Bearer valid-token");

            expect(response.status).toBe(404);
            expect(prismaMock.userKanji.upsert).not.toHaveBeenCalled();
        });
    });

    describe("GET /api/user-kanji (List)", () => {
        it("seharusnya berhasil melihat list dengan filter isMemorized=true dan mengambil size tertentu", async () => {
            mockAuthSuccess();
            const mockListResult = [
                { kanjiId: "123e4567-e89b-12d3-a456-426614174006", isMemorized: true }
            ];

            prismaMock.userKanji.findMany.mockResolvedValue(mockListResult);
            prismaMock.userKanji.count.mockResolvedValue(1);

            const response = await request(app)
                .get("/api/user-kanji?size=10&page=1&isMemorized=true")
                .set("Authorization", "Bearer valid-token");

            expect(response.status).toBe(200);
            expect(response.body.data).toEqual(mockListResult);
            expect(response.body.paging.total_item).toBe(1);

            expect(prismaMock.userKanji.findMany).toHaveBeenCalledWith(expect.objectContaining({
                take: 10,
                where: { userId: "user-1", isMemorized: true }
            }));
            
            expect(prismaMock.userKanji.count).toHaveBeenCalledWith(expect.objectContaining({
                where: { userId: "user-1", isMemorized: true }
            }));
        });
    });

    describe("DELETE /api/user-kanji/:kanjiId (Delete Progress)", () => {
        it("seharusnya berhasil menghapus data hafalan kanji", async () => {
            mockAuthSuccess();
            const mockUserKanji = {
                userId: "user-1",
                kanjiId: "123e4567-e89b-12d3-a456-426614174001"
            };

            prismaMock.userKanji.findUnique.mockResolvedValue(mockUserKanji);
            prismaMock.userKanji.delete.mockResolvedValue(mockUserKanji);

            const response = await request(app)
                .delete("/api/user-kanji/123e4567-e89b-12d3-a456-426614174001")
                .set("Authorization", "Bearer valid-token");

            expect(response.status).toBe(200);
            expect(response.body.data).toBe("OK");
            expect(prismaMock.userKanji.delete).toHaveBeenCalledWith(expect.objectContaining({
                where: { userId_kanjiId: { userId: "user-1", kanjiId: "123e4567-e89b-12d3-a456-426614174001" } }
            }));
        });

        it("seharusnya gagal menghapus (404) jika data progres tidak ditemukan", async () => {
            mockAuthSuccess();
            prismaMock.userKanji.findUnique.mockResolvedValue(null);

            const response = await request(app)
                .delete("/api/user-kanji/123e4567-e89b-12d3-a456-426614174002")
                .set("Authorization", "Bearer valid-token");

            expect(response.status).toBe(404);
            expect(response.body.error).toBe("Data Progress Kanji Tidak Ditemukan");
            expect(prismaMock.userKanji.delete).not.toHaveBeenCalled();
        });
    });
});
