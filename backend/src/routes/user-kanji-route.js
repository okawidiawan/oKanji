import express from 'express';
import { authMiddleware } from '../middleware/auth-middleware.js';
import * as userKanjiController from '../controller/user-kanji-controller.js';

const userKanjiRouter = express.Router();

userKanjiRouter.use(authMiddleware);

userKanjiRouter.post('/api/user-kanji', userKanjiController.upsert);
userKanjiRouter.put('/api/user-kanji/:kanjiId', userKanjiController.upsert);
userKanjiRouter.get('/api/user-kanji', userKanjiController.list);
userKanjiRouter.get('/api/user-kanji/:kanjiId', userKanjiController.get);

export { userKanjiRouter };
