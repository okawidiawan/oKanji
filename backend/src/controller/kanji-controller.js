import * as kanjiService from '../services/kanji-service.js';

/**
 * Mengambil daftar kanji dengan dukungan paginasi, filter level JLPT, pencarian, dan pengurutan.
 */
const list = async (req, res, next) => {
  try {
    // Menyusun objek request dari query parameters
    const request = {
      level: req.query.level,
      search: req.query.search,
      page: req.query.page,
      size: req.query.size,
      sort_by: req.query.sort_by,
      sort_order: req.query.sort_order
    };

    // Memanggil service untuk mengambil data
    const result = await kanjiService.list(req.user, request);
    res.status(200).json(result);
  } catch (e) {
    // Meneruskan error ke middleware penanganan error
    next(e);
  }
};

/**
 * Mengambil detail satu kanji berdasarkan ID.
 */
const get = async (req, res, next) => {
  try {
    const kanjiId = req.params.kanjiId;
    const result = await kanjiService.get(kanjiId);
    res.status(200).json({
      data: result
    });
  } catch (e) {
    next(e);
  }
};

export { list, get };
