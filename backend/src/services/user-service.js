import bcrypt from 'bcrypt';
import { prisma } from '../application/database.js';
import { ResponseError } from '../error/response-error.js';
import { v4 as uuid } from 'uuid';
import { registerUserValidation, loginUserValidation, updateUserValidation } from '../validation/user-validation.js';

/**
 * Melakukan registrasi pengguna baru.
 * Mencakup validasi data, pengecekan email unik, dan hashing password.
 */
const register = async (request) => {
    // Validasi skema data registrasi
    request = registerUserValidation.parse(request);

    // Memastikan email belum pernah digunakan
    const countUser = await prisma.user.count({
        where: {
            email: request.email
        }
    });

    if (countUser > 0) {
        throw new ResponseError(400, "Email sudah terdaftar");
    }

    // Hashing password demi keamanan sebelum disimpan
    const password = await bcrypt.hash(request.password, 10);

    return prisma.user.create({
        data: {
            username: request.name,
            name: request.name,
            email: request.email,
            password: password
        },
        select: {
            email: true,
            name: true
        }
    });
};

/**
 * Melakukan proses login user.
 * Memverifikasi email dan password, lalu mengembalikan token akses unik.
 */
const login = async (request) => {
    // Validasi skema input login
    request = loginUserValidation.parse(request);

    // Mencari user berdasarkan email
    const user = await prisma.user.findUnique({
        where: {
            email: request.email
        }
    });

    // Validasi keberadaan user
    if (!user) {
        throw new ResponseError(401, "Email atau password salah");
    }

    // Memverifikasi kecocokan password dengan hash di database
    const isPasswordValid = await bcrypt.compare(request.password, user.password);
    if (!isPasswordValid) {
        throw new ResponseError(401, "Email atau password salah");
    }

    // Membuat token akses baru (UUID) untuk sesi user
    const token = uuid();
    return prisma.user.update({
        where: {
            email: request.email
        },
        data: {
            token: token
        },
        select: {
            token: true
        }
    });
};

/**
 * Melakukan logout dengan menghapus token akses user.
 */
const logout = async (email) => {
    return prisma.user.update({
        where: {
            email: email
        },
        data: {
            token: null
        },
        select: {
            email: true
        }
    });
};

/**
 * Mengambil profil data diri pengguna berdasarkan email.
 */
const get = async (email) => {
    const user = await prisma.user.findUnique({
        where: {
            email: email
        },
        select: {
            username: true,
            email: true,
            name: true
        }
    });

    if (!user) {
        throw new ResponseError(404, "User is not found");
    }

    return user;
};

/**
 * Memperbarui data diri pengguna (nama atau password).
 * Mendukung update parsial.
 */
const update = async (email, request) => {
    // Validasi skema update data
    const userRequest = updateUserValidation.parse(request);

    // Memastikan user yang akan di-update ada di database
    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    });

    if (!user) {
        throw new ResponseError(404, "User is not found");
    }

    // Menyiapkan data yang akan di-update (jika disediakan)
    const data = {};
    if (userRequest.name) {
        data.name = userRequest.name;
    }
    if (userRequest.password) {
        data.password = await bcrypt.hash(userRequest.password, 10);
    }

    return prisma.user.update({
        where: {
            email: email
        },
        data: data,
        select: {
            username: true,
            name: true
        }
    });
};

export { register, login, logout, get, update };
