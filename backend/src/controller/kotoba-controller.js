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

/**
 * Menangani request untuk memperbarui data kotoba.
 */
const update = async (req, res, next) => {
  try {
    const kotobaId = req.params.kotobaId;
    const request = req.body;
    const result = await kotobaService.update(kotobaId, request);
    res.status(200).json({
      data: result
    });
  } catch (e) {
    next(e);
  }
};

/**
 * Menangani request untuk menghapus data kotoba.
 */
const remove = async (req, res, next) => {
  try {
    const kotobaId = req.params.kotobaId;
    const result = await kotobaService.remove(kotobaId);
    res.status(200).json({
      data: result
    });
  } catch (e) {
    next(e);
  }
};

export { create, update, remove };
