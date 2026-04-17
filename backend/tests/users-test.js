import { describe, it, expect, beforeEach, mock, spyOn } from "bun:test";
import request from "supertest";
import bcrypt from "bcrypt";

const prismaMock = {
    user: {
        count: mock(),
        create: mock(),
        findUnique: mock(),
        update: mock()
    }
};

mock.module("../src/application/database.js", () => {
    return { prisma: prismaMock };
});

import { app } from "../src/application/web.js";

describe("User API", () => {
    beforeEach(() => {
        prismaMock.user.count.mockReset();
        prismaMock.user.create.mockReset();
        prismaMock.user.findUnique.mockReset();
        prismaMock.user.update.mockReset();
    });

    describe("POST /api/users", () => {
        it("seharusnya berhasil mendaftarkan pengguna baru", async () => {
            prismaMock.user.count.mockResolvedValue(0);
            prismaMock.user.create.mockResolvedValue({
                email: "test@example.com"
            });
            spyOn(bcrypt, "hash").mockResolvedValue("hashedpassword");

            const response = await request(app)
                .post("/api/users")
                .send({
                    name: "Test User",
                    email: "test@example.com",
                    password: "password123"
                });

            expect(response.status).toBe(201);
            expect(response.body.data).toBe("OK");
            expect(prismaMock.user.count).toHaveBeenCalledTimes(1);
            expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
        });

        it("seharusnya menolak registrasi jika email sudah terdaftar", async () => {
            prismaMock.user.count.mockResolvedValue(1);

            const response = await request(app)
                .post("/api/users")
                .send({
                    name: "Test User",
                    email: "test@example.com",
                    password: "password123"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
            expect(prismaMock.user.create).not.toHaveBeenCalled();
        });

        it("seharusnya menolak registrasi jika field tidak valid", async () => {
             const response = await request(app)
                .post("/api/users")
                .send({
                    name: "",
                    email: "invalid-email",
                    password: "123"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });
    });

    describe("POST /api/users/login", () => {
        it("seharusnya berhasil login dan mendapatkan token", async () => {
            prismaMock.user.findUnique.mockResolvedValue({
                email: "test@example.com",
                password: "hashedpassword"
            });
            spyOn(bcrypt, "compare").mockResolvedValue(true);
            prismaMock.user.update.mockResolvedValue({
                token: "dummy-token"
            });

            const response = await request(app)
                .post("/api/users/login")
                .send({
                    email: "test@example.com",
                    password: "password123"
                });

            expect(response.status).toBe(200);
            expect(response.body.data).toBe("dummy-token");
        });

        it("seharusnya gagal login jika password salah", async () => {
            prismaMock.user.findUnique.mockResolvedValue({
                email: "test@example.com",
                password: "hashedpassword"
            });
            spyOn(bcrypt, "compare").mockResolvedValue(false);

            const response = await request(app)
                .post("/api/users/login")
                .send({
                    email: "test@example.com",
                    password: "wrongpassword"
                });

            expect(response.status).toBe(401);
            expect(response.body.error).toBeDefined();
        });

        it("seharusnya gagal login jika user tidak ditemukan", async () => {
             prismaMock.user.findUnique.mockResolvedValue(null);

             const response = await request(app)
                .post("/api/users/login")
                .send({
                    email: "test@example.com",
                    password: "password123"
                });

            expect(response.status).toBe(401);
            expect(response.body.error).toBeDefined();
        });
    });

    describe("DELETE /api/users/logout", () => {
        it("seharusnya berhasil logout jika memberikan token yang valid", async () => {
            prismaMock.user.findUnique.mockResolvedValue({
                id: "user-1",
                email: "test@example.com",
                token: "dummy-token"
            });
            prismaMock.user.update.mockResolvedValue({
                email: "test@example.com"
            });

            const response = await request(app)
                .delete("/api/users/logout")
                .set("Authorization", "Bearer dummy-token");

            expect(response.status).toBe(200);
            expect(response.body.data).toBe("OK");
            expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
        });

        it("seharusnya gagal logout (401) jika tanpa token", async () => {
            const response = await request(app)
                .delete("/api/users/logout");

            expect(response.status).toBe(401);
            expect(response.body.errors).toBe("Unauthorized");
        });
    });
});
