import * as userKanjiService from '../services/user-kanji-service.js';

/**
 * Menyimpan atau memperbarui progres belajar kanji (memorized, difficulty, note).
 * Mendukung input kanjiId via body atau parameter URL.
 */
const upsert = async (req, res, next) => {
    try {
        const user = req.user;
        const request = req.body;
        
        // Memastikan kanjiId diambil dari params jika tersedia (mendukung PUT /:kanjiId)
        if (req.params.kanjiId) {
            request.kanjiId = req.params.kanjiId;
        }

        const result = await userKanjiService.upsert(user, request);
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

export { upsert, get, list };
