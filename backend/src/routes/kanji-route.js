import express from 'express';
import { authMiddleware } from '../middleware/auth-middleware.js';
import * as kanjiController from '../controller/kanji-controller.js';

const kanjiRouter = express.Router();

kanjiRouter.use(authMiddleware);
kanjiRouter.get('/api/kanjis', kanjiController.list);

export { kanjiRouter };
