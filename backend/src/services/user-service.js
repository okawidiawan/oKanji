import bcrypt from 'bcrypt';
import { prisma } from '../application/database.js';
import { ResponseError } from '../error/response-error.js';
import { v4 as uuid } from 'uuid';
import { registerUserValidation, loginUserValidation } from '../validation/user-validation.js';

const register = async (request) => {
    request = registerUserValidation.parse(request);

    const countUser = await prisma.user.count({
        where: {
            email: request.email
        }
    });

    if (countUser > 0) {
        throw new ResponseError(400, "Email sudah terdaftar");
    }

    const password = await bcrypt.hash(request.password, 10);

    return prisma.user.create({
        data: {
            username: request.name,
            name: request.name,
            email: request.email,
            password: password
        },
        select: {
            email: true,
            name: true
        }
    });
};

const login = async (request) => {
    request = loginUserValidation.parse(request);

    const user = await prisma.user.findUnique({
        where: {
            email: request.email
        }
    });

    if (!user) {
        throw new ResponseError(401, "Email atau password salah");
    }

    const isPasswordValid = await bcrypt.compare(request.password, user.password);
    if (!isPasswordValid) {
        throw new ResponseError(401, "Email atau password salah");
    }

    const token = uuid();
    return prisma.user.update({
        where: {
            email: request.email
        },
        data: {
            token: token
        },
        select: {
            token: true
        }
    });
};

const logout = async (email) => {
    return prisma.user.update({
        where: {
            email: email
        },
        data: {
            token: null
        },
        select: {
            email: true
        }
    });
};

const get = async (email) => {
    const user = await prisma.user.findUnique({
        where: {
            email: email
        },
        select: {
            username: true,
            email: true,
            name: true
        }
    });

    if (!user) {
        throw new ResponseError(404, "User is not found");
    }

    return user;
};

export { register, login, logout, get };
