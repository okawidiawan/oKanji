import * as userKanjiService from '../services/user-kanji-service.js';

/**
 * Menyimpan atau memperbarui progres belajar kanji (memorized, difficulty, note).
 * Mendukung input kanjiId via body atau parameter URL.
 */
const add = async (req, res, next) => {
    try {
        const user = req.user;
        // Inisialisasi objek request, pastikan tidak undefined jika body kosong
        const request = req.body || {};
        
        // Memastikan kanjiId diambil dari params jika tersedia
        if (req.params.kanjiId) {
            request.kanjiId = req.params.kanjiId;
        }

        const result = await userKanjiService.add(user, request);
        // Status 200 karena endpoint ini menggunakan upsert (create atau update)
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

/**
 * Mengambil detail progres belajar untuk satu kanji tertentu.
 */
const get = async (req, res, next) => {
    try {
        const user = req.user;
        const kanjiId = req.params.kanjiId;
        const result = await userKanjiService.get(user, kanjiId);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

/**
 * Mengambil daftar semua progres belajar kanji milik user dengan filter dan paginasi.
 */
const list = async (req, res, next) => {
    try {
        const user = req.user;
        // Menyiapkan parameter filter pencarian
        const request = {
            page: req.query.page,
            size: req.query.size,
            isMemorized: req.query.isMemorized
        };

        const result = await userKanjiService.list(user, request);
        res.status(200).json(result);
    } catch (e) {
        next(e);
    }
};

/**
 * Menghapus progres belajar kanji milik user.
 */
const remove = async (req, res, next) => {
    try {
        const user = req.user;
        const kanjiId = req.params.kanjiId;

        await userKanjiService.remove(user, kanjiId);
        res.status(200).json({
            data: "OK"
        });
    } catch (e) {
        next(e);
    }
};

/**
 * Memperbarui progres belajar kanji (partial update).
 * Mengambil kanjiId dari URL parameter dan data pembaruan dari request body.
 */
const update = async (req, res, next) => {
    try {
        const user = req.user;
        // Menggabungkan data dari body dengan kanjiId dari parameter URL
        const request = {
            ...req.body,
            kanjiId: req.params.kanjiId
        };

        const result = await userKanjiService.update(user, request);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

export { add, get, list, remove, update };
