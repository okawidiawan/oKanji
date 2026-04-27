import * as userKotobaService from "../services/user-kotoba-service.js";

/**
 * Handler untuk menambahkan kotoba ke dalam daftar hafalan user.
 */
const add = async (req, res, next) => {
    try {
        const user = req.user;
        const kotobaId = req.params.kotobaId;
        const result = await userKotobaService.add(user, kotobaId);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        // Teruskan error ke error-middleware
        next(e);
    }
};

export {
    add
};
