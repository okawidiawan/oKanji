import { ResponseError } from './response-error.js';
import { ZodError } from 'zod';
import { logger } from '../application/logger.js';

/**
 * Middleware untuk menangani error secara terpusat.
 * Mengonversi berbagai jenis error (Zod, ResponseError, generic) ke format JSON yang konsisten.
 */
const errorMiddleware = (err, req, res, next) => {
    // Jika tidak ada error, lanjut ke middleware berikutnya
    if (!err) {
        next();
        return;
    }

    const isProduction = process.env.NODE_ENV === 'production';

    // Logging error ke sisi server untuk debugging menggunakan Winston logger
    logger.error('Server Error', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    if (err instanceof ResponseError) {
        // Menangani error kustom aplikasi (misal: 400, 404, 401)
        res.status(err.status).json({
            error: err.message
        });
    } else if (err instanceof ZodError) {
        // Menangani error validasi dari Zod
        res.status(400).json({
            error: "Validation Error",
            details: err.issues.map(e => ({
                field: e.path.join('.'),
                message: e.message
            }))
        });
    } else {
        // Menangani error internal server (500)
        const errorResponse = {
            error: isProduction ? "Internal Server Error" : err.message
        };
        // Menyertakan stack trace hanya jika bukan di environment produksi
        if (!isProduction) {
            errorResponse.details = err.stack;
        }
        res.status(500).json(errorResponse);
    }
};

export { errorMiddleware };
