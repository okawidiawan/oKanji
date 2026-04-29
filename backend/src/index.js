import 'dotenv/config';
import { app } from './application/web.js';
import { prisma } from './application/database.js';
import { logger } from './application/logger.js';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});

// FIX-12: Graceful shutdown
const shutdown = async () => {
    logger.info('Shutting down gracefully...');
    server.close();
    await prisma.$disconnect();
    process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
