const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
    const token = req.get('Authorization');
    if (!token) {
        res.status(401).json({
            errors: "Unauthorized"
        }).end();
        return;
    }

    const user = await prisma.user.findUnique({
        where: {
            token: token
        }
    });

    if (!user) {
        res.status(401).json({
            errors: "Unauthorized"
        }).end();
        return;
    }

    req.user = user;
    next();
};

module.exports = {
    authMiddleware
};
