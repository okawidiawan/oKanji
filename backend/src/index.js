import 'dotenv/config';
import { app } from './application/web.js';
import { prisma } from './application/database.js';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// FIX-12: Graceful shutdown
const shutdown = async () => {
    console.log('Shutting down gracefully...');
    server.close();
    await prisma.$disconnect();
    process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
