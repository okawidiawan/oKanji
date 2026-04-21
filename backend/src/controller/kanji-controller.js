import * as kanjiService from '../services/kanji-service.js';

const list = async (req, res, next) => {
  try {
    const request = {
      level: req.query.level,
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit
    };

    const result = await kanjiService.list(request);
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

export { list };
