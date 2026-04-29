import winston from "winston";

/**
 * Konfigurasi Winston logger terpusat.
 * Mendukung format berbeda untuk development (readable + warna) dan production (JSON + file output).
 * Level logging dikontrol via environment variable `LOG_LEVEL`.
 */

const { combine, timestamp, printf, colorize, json } = winston.format;

// Format kustom untuk log di console saat development
const devLogFormat = printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
});

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
    format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        process.env.NODE_ENV === "production" ? json() : combine(colorize(), devLogFormat)
    ),
    transports: [
        new winston.transports.Console()
    ],
});

// Tambahkan transport file jika di environment production
if (process.env.NODE_ENV === "production") {
    logger.add(new winston.transports.File({ 
        filename: "logs/error.log", 
        level: "error",
        dirname: "logs"
    }));
    logger.add(new winston.transports.File({ 
        filename: "logs/combined.log",
        dirname: "logs"
    }));
}

export { logger };
