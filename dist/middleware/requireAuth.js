"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).send({ message: 'Not Authorized.' });
    }
    next();
};
exports.requireAuth = requireAuth;
