const { ResponseError } = require('./response-error');

const errorMiddleware = (err, req, res, next) => {
  if (!err) {
    next();
    return;
  }

  const isProduction = process.env.NODE_ENV === 'production';
  
  // Server-side logging
  console.error('[SERVER ERROR]:', err);

  const errorResponse = {
    error: {
      code: 500,
      message: isProduction ? "Internal Server Error" : err.message
    }
  };

  if (err instanceof ResponseError) {
    errorResponse.error.code = err.status;
    errorResponse.error.message = err.message;
    res.status(err.status).json(errorResponse).end();
  } else {
    // Non-production: add stack trace/details
    if (!isProduction) {
      errorResponse.error.details = err.stack;
    }
    res.status(500).json(errorResponse).end();
  }
};

module.exports = { errorMiddleware };
