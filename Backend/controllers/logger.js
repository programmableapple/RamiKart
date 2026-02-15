const winston = require("winston");
require("winston-daily-rotate-file");
const { combine, timestamp, printf, colorize, align } = winston.format;

// Box width for structured logs
const BOX_WIDTH = 52;

// Console output format
const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  align(),
  printf((info) => {
    const { timestamp, level, message, ...args } = info;
    return `[${timestamp}] ${level}: ${message} ${
      Object.keys(args).length ? JSON.stringify(args, null, 2) : ''
    }`;
  })
);

// File output format
const fileFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  printf((info) => {
    const { timestamp, level, message, ...args } = info;
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...args
    }, null, 2);
  })
);

// Rotating file transport
const transport = new winston.transports.DailyRotateFile({
  filename: "logs/%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
  format: fileFormat
});

// Create logger
const logger = winston.createLogger({
  level: "info",
  transports: [
    transport,
    new winston.transports.Console({ format: consoleFormat })
  ]
});

// ✅ Custom emoji-based methods
logger.success = function(message, meta) {
  this.log('info', { message: `✅ ${message}`, ...meta });
};

logger.warning = function(message, meta) {
  this.log('warn', { message: `⚠️ ${message}`, ...meta });
};

logger.error = function(message, meta) {
  this.log('error', { message: `❌ ${message}`, ...meta });
};

logger.debug = function(message, meta) {
  this.log('debug', { message: `🐛 ${message}`, ...meta });
};

// ╔════════════════════════════════════════════╗
// ║          STRUCTURED REQUEST LOGGING        ║
// ╚════════════════════════════════════════════╝

logger.BOX_WIDTH = BOX_WIDTH;

logger._boxLine = function(content = "", prefix = "║", suffix = "║") {
  const padded = content.padEnd(this.BOX_WIDTH, " ");
  return `${prefix} ${padded} ${suffix}`;
};

logger.logRequestStart = function(req) {
  this.info("╔" + "═".repeat(this.BOX_WIDTH + 2) + "╗");
  this.info(this._boxLine("NEW REQUEST INCOMING"));
  this.info("╠" + "═".repeat(this.BOX_WIDTH + 2) + "╣");
  this.info(this._boxLine(`Method: ${req.method}`));
  this.info(this._boxLine(`Path: ${req.path}`));
  this.info(this._boxLine(`IP: ${req.ip}`));
};

logger.logRequestEnd = function(res) {
  this.info(this._boxLine(`Response: ${res.statusCode}`));
  this.info(this._boxLine(`Message: ${res.statusMessage || "OK"}`));
  this.info("╚" + "═".repeat(this.BOX_WIDTH + 2) + "╝");
};

module.exports = logger;
