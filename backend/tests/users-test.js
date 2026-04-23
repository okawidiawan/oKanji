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
                username: "testuser",
                email: "test@example.com",
                name: "Test User"
            });
            spyOn(bcrypt, "hash").mockResolvedValue("hashedpassword");

            const response = await request(app)
                .post("/api/users")
                .send({
                    username: "testuser",
                    name: "Test User",
                    email: "test@example.com",
                    password: "password123"
                });

            expect(response.status).toBe(201);
            expect(response.body.data).toBe("OK");
            expect(prismaMock.user.count).toHaveBeenCalled();
            expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
        });

        it("seharusnya menolak registrasi jika email sudah terdaftar", async () => {
            prismaMock.user.count.mockResolvedValue(1);

            const response = await request(app)
                .post("/api/users")
                .send({
                    username: "testuser",
                    name: "Test User",
                    email: "test@example.com",
                    password: "password123"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe("Email sudah terdaftar");
        });

        it("seharusnya menolak registrasi jika username sudah terdaftar", async () => {
            prismaMock.user.count.mockImplementation((args) => {
                if (args.where.email) return 0;
                if (args.where.username) return 1;
                return 0;
            });

            const response = await request(app)
                .post("/api/users")
                .send({
                    username: "testuser",
                    name: "Test User",
                    email: "test@example.com",
                    password: "password123"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe("Username sudah digunakan");
        });

        it("seharusnya menolak registrasi jika username mengandung karakter spesial", async () => {
            const response = await request(app)
               .post("/api/users")
               .send({
                   username: "user@name",
                   name: "Test User",
                   email: "test@example.com",
                   password: "password123"
               });

           expect(response.status).toBe(400);
           expect(response.body.error).toBe("Validation Error");
        });

        it("seharusnya menolak registrasi jika field tidak valid", async () => {
             const response = await request(app)
                .post("/api/users")
                .send({
                    username: "tu",
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
            expect(response.body.error).toBe("Unauthorized");
        });
    });
    describe("GET /api/users/current", () => {
        it("seharusnya berhasil mengambil data user yang sedang login", async () => {
            prismaMock.user.findUnique.mockResolvedValue({
                id: "user-1",
                username: "okawidiawan",
                name: "Oka Widiawan",
                email: "oka@gmail.com",
                token: "dummy-token"
            });

            const response = await request(app)
                .get("/api/users/current")
                .set("Authorization", "Bearer dummy-token");

            expect(response.status).toBe(200);
            expect(response.body.data.username).toBe("okawidiawan");
            expect(response.body.data.name).toBe("Oka Widiawan");
            expect(response.body.data.email).toBe("oka@gmail.com");
        });

        it("seharusnya gagal (401) jika token tidak valid", async () => {
            prismaMock.user.findUnique.mockResolvedValue(null);

            const response = await request(app)
                .get("/api/users/current")
                .set("Authorization", "Bearer invalid-token");

            expect(response.status).toBe(401);
            expect(response.body.error).toBe("Unauthorized");
        });
    });

    describe("PATCH /api/users/current", () => {
        it("seharusnya berhasil memperbarui nama", async () => {
            prismaMock.user.findUnique.mockResolvedValue({
                id: 1,
                email: "test@example.com",
                token: "dummy-token"
            });

            prismaMock.user.update.mockResolvedValue({
                username: "testuser",
                name: "Updated Name"
            });

            const response = await request(app)
                .patch("/api/users/current")
                .set("Authorization", "Bearer dummy-token")
                .send({
                    name: "Updated Name"
                });

            expect(response.status).toBe(200);
            expect(response.body.data.name).toBe("Updated Name");
        });

        it("seharusnya berhasil memperbarui email", async () => {
            prismaMock.user.findUnique.mockResolvedValue({
                id: 1,
                email: "test@example.com",
                token: "dummy-token"
            });

            prismaMock.user.count.mockResolvedValue(0); // Email baru belum digunakan

            prismaMock.user.update.mockResolvedValue({
                username: "testuser",
                email: "newemail@example.com"
            });

            const response = await request(app)
                .patch("/api/users/current")
                .set("Authorization", "Bearer dummy-token")
                .send({
                    email: "newemail@example.com"
                });

            expect(response.status).toBe(200);
            expect(response.body.data.email).toBe("newemail@example.com");
        });

        it("seharusnya gagal update email jika email sudah digunakan user lain", async () => {
            prismaMock.user.findUnique.mockResolvedValue({
                id: 1,
                email: "test@example.com",
                token: "dummy-token"
            });

            prismaMock.user.count.mockResolvedValue(1); // Email baru sudah digunakan

            const response = await request(app)
                .patch("/api/users/current")
                .set("Authorization", "Bearer dummy-token")
                .send({
                    email: "other@example.com"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe("Email sudah digunakan");
        });

        it("seharusnya berhasil memperbarui password", async () => {
            prismaMock.user.findUnique.mockResolvedValue({
                id: 1,
                email: "test@example.com",
                token: "dummy-token"
            });

            prismaMock.user.update.mockResolvedValue({
                username: "testuser",
                name: "Test User"
            });

            spyOn(bcrypt, "hash").mockResolvedValue("newhashedpassword");

            const response = await request(app)
                .patch("/api/users/current")
                .set("Authorization", "Bearer dummy-token")
                .send({
                    password: "newpassword123"
                });

            expect(response.status).toBe(200);
            expect(response.body.data.username).toBe("testuser");
        });

        it("seharusnya gagal jika nama tidak valid (kosong)", async () => {
            prismaMock.user.findUnique.mockResolvedValue({
                id: 1,
                email: "test@example.com",
                token: "dummy-token"
            });

            const response = await request(app)
                .patch("/api/users/current")
                .set("Authorization", "Bearer dummy-token")
                .send({
                    name: ""
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("seharusnya gagal (401) jika tidak terautentikasi", async () => {
            const response = await request(app)
                .patch("/api/users/current")
                .send({
                    name: "Ghost Update"
                });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe("Unauthorized");
        });

        it("seharusnya gagal (400) jika update dengan body kosong", async () => {
            prismaMock.user.findUnique.mockResolvedValue({
                id: 1,
                email: "test@example.com",
                token: "dummy-token"
            });

            const response = await request(app)
                .patch("/api/users/current")
                .set("Authorization", "Bearer dummy-token")
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("seharusnya gagal (400) jika update password terlalu pendek", async () => {
            prismaMock.user.findUnique.mockResolvedValue({
                id: 1,
                email: "test@example.com",
                token: "dummy-token"
            });

            const response = await request(app)
                .patch("/api/users/current")
                .set("Authorization", "Bearer dummy-token")
                .send({
                    password: "short"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });
    });
});
