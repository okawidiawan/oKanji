import * as userService from '../services/user-service.js';

const register = async (req, res, next) => {
    try {
        await userService.register(req.body);
        res.status(201).json({
            data: "OK"
        });
    } catch (e) {
        next(e);
    }
};

const login = async (req, res, next) => {
    try {
        const result = await userService.login(req.body);
        res.status(200).json({
            data: result.token
        });
    } catch (e) {
        next(e);
    }
};

const logout = async (req, res, next) => {
    try {
        await userService.logout(req.user.email);
        res.status(200).json({
            data: "OK"
        });
    } catch (e) {
        next(e);
    }
};

const get = async (req, res, next) => {
    try {
        const result = await userService.get(req.user.email);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

const update = async (req, res, next) => {
    try {
        const result = await userService.update(req.user.email, req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

export { register, login, logout, get, update };
