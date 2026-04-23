import * as kanjiService from '../services/kanji-service.js';

/**
 * Mengambil daftar kanji dengan dukungan paginasi, filter level JLPT, dan pencarian.
 */
const list = async (req, res, next) => {
  try {
    // Menyusun objek request dari query parameters
    const request = {
      level: req.query.level,
      search: req.query.search,
      page: req.query.page,
      size: req.query.size
    };

    // Memanggil service untuk mengambil data
    const result = await kanjiService.list(request);
    res.status(200).json(result);
  } catch (e) {
    // Meneruskan error ke middleware penanganan error
    next(e);
  }
};

export { list };
