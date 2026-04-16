const userKanjiService = require('../services/user-kanji-service');

const upsert = async (req, res, next) => {
    try {
        const user = req.user;
        const request = req.body;
        // In case kanjiId is in param, use it, otherwise use body
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

const list = async (req, res, next) => {
    try {
        const user = req.user;
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

module.exports = {
    upsert,
    get,
    list
};
