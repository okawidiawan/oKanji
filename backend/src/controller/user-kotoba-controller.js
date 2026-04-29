import * as userKotobaService from "../services/user-kotoba-service.js";

/**
 * Handler untuk menambahkan kotoba ke dalam daftar hafalan user.
 */
const add = async (req, res, next) => {
    try {
        const user = req.user;
        const kotobaId = req.params.kotobaId;
        const result = await userKotobaService.add(user, kotobaId);
        // Status 200 karena endpoint ini menggunakan upsert (create atau update)
        res.status(200).json({
            data: result
        });
    } catch (e) {
        // Teruskan error ke error-middleware
        next(e);
    }
};

/**
 * Handler untuk memperbarui detail progres hafalan kotoba user.
 */
const update = async (req, res, next) => {
    try {
        const user = req.user;
        const request = {
            ...req.body,
            kotobaId: req.params.kotobaId
        };

        const result = await userKotobaService.update(user, request);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

/**
 * Handler untuk menghapus kotoba dari daftar hafalan user.
 */
const remove = async (req, res, next) => {
    try {
        const user = req.user;
        const kotobaId = req.params.kotobaId;

        await userKotobaService.remove(user, kotobaId);
        res.status(200).json({
            data: "OK"
        });
    } catch (e) {
        next(e);
    }
};

export {
    add,
    update,
    remove
};
