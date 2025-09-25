"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
exports.requireAdmin = requireAdmin;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ormconfig_1 = require("../ormconfig");
const User_1 = require("../entities/User");
/**
 * Authentication middleware that validates a JWT from the `Authorization`
 * header. If valid, it attaches the authenticated user to `req.user`.
 */
function authenticateToken(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Missing authorization token" });
        }
        try {
            const secret = process.env.JWT_SECRET || "changeme";
            const payload = jsonwebtoken_1.default.verify(token, secret);
            const userRepo = ormconfig_1.AppDataSource.getRepository(User_1.User);
            const user = yield userRepo.findOne({
                where: { id: payload.userId },
                relations: ["persona", "friends"],
            });
            if (!user) {
                return res.status(401).json({ message: "Invalid token" });
            }
            // @ts-ignore attach user property to request
            req.user = user;
            next();
        }
        catch (err) {
            return res.status(401).json({ message: "Invalid token" });
        }
    });
}
/**
 * Authorization middleware that ensures the authenticated user has admin
 * privileges. Should be used after authenticateToken.
 */
function requireAdmin(req, res, next) {
    // @ts-ignore
    const user = req.user;
    if (!user || !user.isAdmin) {
        return res
            .status(403)
            .json({ message: "Forbidden: admin privileges required" });
    }
    next();
}
