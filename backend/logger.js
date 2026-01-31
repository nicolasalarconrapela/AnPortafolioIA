/**
 * Simple Structured Logger for AnPortafolioIA
 */
const getTimestamp = () => new Date().toISOString();

const formatMessage = (level, message, meta = {}) => {
    return JSON.stringify({
        timestamp: getTimestamp(),
        level,
        message,
        ...meta
    });
};

export const logger = {
    info: (message, meta) => console.log(formatMessage('INFO', message, meta)),
    error: (message, meta) => console.error(formatMessage('ERROR', message, meta)),
    warn: (message, meta) => console.warn(formatMessage('WARN', message, meta)),
    debug: (message, meta) => console.debug(formatMessage('DEBUG', message, meta)),
};

/**
 * Middleware request logger
 */
export const requestLogger = (req, res, next) => {
    const start = Date.now();

    // Hook into response finish to log duration and status
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info('HTTP Request', {
            method: req.method,
            url: req.originalUrl || req.url,
            status: res.statusCode,
            durationMs: duration,
            userAgent: req.get('user-agent'),
            ip: req.ip
        });
    });

    next();
};
