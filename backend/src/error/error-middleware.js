import { ResponseError } from './response-error.js';
import { ZodError } from 'zod';

const errorMiddleware = (err, req, res, next) => {
    if (!err) {
        next();
        return;
    }

    const isProduction = process.env.NODE_ENV === 'production';

    // Server-side logging
    console.error('[SERVER ERROR]:', err);

    if (err instanceof ResponseError) {
        res.status(err.status).json({
            error: {
                code: err.status,
                message: err.message
            }
        }).end();
    } else if (err instanceof ZodError) {
        res.status(400).json({
            error: {
                code: 400,
                message: "Validation Error",
                details: err.issues.map(e => ({
                    field: e.path.join('.'),
                    message: e.message
                }))
            }
        }).end();
    } else {
        const errorResponse = {
            error: {
                code: 500,
                message: isProduction ? "Internal Server Error" : err.message
            }
        };
        if (!isProduction) {
            errorResponse.error.details = err.stack;
        }
        res.status(500).json(errorResponse).end();
    }
};

export { errorMiddleware };
