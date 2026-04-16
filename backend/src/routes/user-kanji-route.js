const express = require('express');
const { authMiddleware } = require('../middleware/auth-middleware');
const userKanjiController = require('../controller/user-kanji-controller');

const userKanjiRouter = new express.Router();

userKanjiRouter.use(authMiddleware);

userKanjiRouter.post('/api/user-kanji', userKanjiController.upsert);
userKanjiRouter.put('/api/user-kanji/:kanjiId', userKanjiController.upsert);
userKanjiRouter.get('/api/user-kanji', userKanjiController.list);
userKanjiRouter.get('/api/user-kanji/:kanjiId', userKanjiController.get);

module.exports = {
    userKanjiRouter
};
