import { z } from 'zod';

/**
 * Skema validasi untuk ID Kotoba (URL Parameter).
 */
const getUserKotobaValidation = z.string().uuid("Format ID Kotoba tidak valid");

export {
    getUserKotobaValidation
};
