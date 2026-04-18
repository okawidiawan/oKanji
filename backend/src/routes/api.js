import express from 'express';
import { authMiddleware } from '../middleware/auth-middleware.js';
import * as userController from '../controller/user-controller.js';
import * as kanjiController from '../controller/kanji-controller.js';
import * as userKanjiController from '../controller/user-kanji-controller.js';

const apiRouter = express.Router();

// Global middleware for all routes in this router
apiRouter.use(authMiddleware);

// User API
apiRouter.delete('/api/users/logout', userController.logout);
apiRouter.get('/api/users/current', userController.get);

// Kanji API
apiRouter.get('/api/kanjis', kanjiController.list);

// User Kanji API
apiRouter.post('/api/user-kanji', userKanjiController.upsert);
apiRouter.put('/api/user-kanji/:kanjiId', userKanjiController.upsert);
apiRouter.get('/api/user-kanji', userKanjiController.list);
apiRouter.get('/api/user-kanji/:kanjiId', userKanjiController.get);

export { apiRouter };
