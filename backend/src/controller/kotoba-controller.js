import * as kotobaService from '../services/kotoba-service.js';

/**
 * Menangani request untuk membuat kotoba baru (single atau batch).
 */
const create = async (req, res, next) => {
  try {
    const result = await kotobaService.create(req.body);
    res.status(201).json({
      data: result
    });
  } catch (e) {
    next(e);
  }
};

export { create };
