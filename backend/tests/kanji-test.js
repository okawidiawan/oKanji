import { describe, it, expect, beforeEach, mock } from "bun:test";
import request from "supertest";

const prismaMock = {
    user: {
        findUnique: mock()
    },
    kanji: {
        findMany: mock(),
        count: mock()
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
        it("seharusnya berhasil mengambil list kanji tanpa filter (default page 1, limit 20)", async () => {
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
                .get("/api/kanjis?page=2&limit=5")
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

        it("seharusnya ditolak atau default bila parameter paginasi tidak valid", async () => {
             mockAuthSuccess();
             const response = await request(app)
                .get("/api/kanjis?page=-1&limit=999")
                .set("Authorization", "Bearer valid-token");
             
             expect(response.status).toBe(400);
             expect(response.body.error).toBeDefined();
        });
    });
});
