import express from 'express';
import { authMiddleware } from '../middleware/auth-middleware.js';
import * as userController from '../controller/user-controller.js';
import * as kanjiController from '../controller/kanji-controller.js';
import * as userKanjiController from '../controller/user-kanji-controller.js';

const apiRouter = express.Router();

/**
 * Middleware Global untuk semua rute dalam router ini.
 * Memastikan semua endpoint di bawah ini memerlukan autentikasi.
 */
apiRouter.use(authMiddleware);

/**
 * API User: Mengelola data profil dan sesi pengguna.
 */
apiRouter.delete('/api/users/logout', userController.logout);
apiRouter.get('/api/users/current', userController.get);
apiRouter.patch('/api/users/current', userController.update);

/**
 * API Kanji: Mengambil data referensi kanji.
 */
apiRouter.get('/api/kanjis', kanjiController.list);

/**
 * API User Kanji: Mengelola progres belajar kanji tiap pengguna.
 */
apiRouter.post('/api/user-kanji/:kanjiId', userKanjiController.add);
apiRouter.get('/api/user-kanji', userKanjiController.list);
apiRouter.get('/api/user-kanji/:kanjiId', userKanjiController.get);

export { apiRouter };
