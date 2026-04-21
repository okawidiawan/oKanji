import * as userService from '../services/user-service.js';

/**
 * Registrasi pengguna baru.
 */
const register = async (req, res, next) => {
    try {
        // Mendaftarkan user melalui user service
        await userService.register(req.body);
        res.status(201).json({
            data: "OK"
        });
    } catch (e) {
        // Meneruskan error jika validasi gagal atau email sudah terdaftar
        next(e);
    }
};

/**
 * Login pengguna untuk mendapatkan token akses.
 */
const login = async (req, res, next) => {
    try {
        // Memverifikasi kredensial dan mendapatkan token
        const result = await userService.login(req.body);
        res.status(200).json({
            data: result.token
        });
    } catch (e) {
        // Meneruskan error (401 Unauthorized) ke middleware
        next(e);
    }
};

/**
 * Logout pengguna dengan menghapus token akses di database.
 */
const logout = async (req, res, next) => {
    try {
        // Menghapus session token berdasarkan email user yang sedang login
        await userService.logout(req.user.email);
        res.status(200).json({
            data: "OK"
        });
    } catch (e) {
        next(e);
    }
};

/**
 * Mengambil profil pengguna yang sedang login.
 */
const get = async (req, res, next) => {
    try {
        // Mengambil data detail user dari database
        const result = await userService.get(req.user.email);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

/**
 * Memperbarui profil pengguna (nama atau password).
 */
const update = async (req, res, next) => {
    try {
        // Melakukan update data berdasarkan body request
        const result = await userService.update(req.user.email, req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

export { register, login, logout, get, update };
