const logger = require('../controllers/logger');

const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Start box log
  logger.logRequestStart(req);

  // Capture when response finishes
  res.on('finish', () => {
    logger.logRequestEnd(res);

    const duration = Date.now() - start;
    logger.info(`⬅️  Response ${res.statusCode} (${duration}ms)`);
  });

  next();
};

module.exports = requestLogger;
