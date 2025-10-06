"use strict";
<<<<<<< HEAD
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
=======
>>>>>>> 712e08e47b3b671c3607c286d1d1ad01f8b90805
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
<<<<<<< HEAD
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
exports.requireAdmin = requireAdmin;
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
=======
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
exports.requireAdmin = requireAdmin;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
>>>>>>> 712e08e47b3b671c3607c286d1d1ad01f8b90805
const ormconfig_1 = require("../ormconfig");
const User_1 = require("../entities/User");
/**
 * Authentication middleware that validates a JWT from the `Authorization`
 * header. If valid, it attaches the authenticated user to `req.user`.
 */
function authenticateToken(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
<<<<<<< HEAD
        try {
            const authHeader = req.headers["authorization"];
            const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(" ")[1];
            if (!token) {
                return res.status(401).json({ message: "Missing authorization token" });
            }
            // ✅ บังคับให้ต้องมี JWT_SECRET จริง ๆ
            if (!process.env.JWT_SECRET) {
                console.error("JWT_SECRET is not set in environment variables!");
                return res.status(500).json({ message: "Server misconfiguration" });
            }
            const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const userRepo = ormconfig_1.AppDataSource.getRepository(User_1.User);
            const user = yield userRepo.findOne({
                where: { id: payload.userId },
                relations: ["persona", "friends"], // ดึง relation มาด้วย
            });
            if (!user) {
                return res.status(401).json({ message: "Invalid or expired token" });
            }
=======
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
>>>>>>> 712e08e47b3b671c3607c286d1d1ad01f8b90805
            req.user = user;
            next();
        }
        catch (err) {
<<<<<<< HEAD
            console.error("Auth error:", err);
            if (err instanceof jsonwebtoken_1.TokenExpiredError) {
                return res.status(401).json({ message: "Token expired" });
            }
            if (err instanceof jsonwebtoken_1.JsonWebTokenError) {
                return res.status(401).json({ message: "Invalid token" });
            }
            return res.status(401).json({ message: "Unauthorized" });
=======
            return res.status(401).json({ message: "Invalid token" });
>>>>>>> 712e08e47b3b671c3607c286d1d1ad01f8b90805
        }
    });
}
/**
 * Authorization middleware that ensures the authenticated user has admin
 * privileges. Should be used after authenticateToken.
 */
function requireAdmin(req, res, next) {
<<<<<<< HEAD
    if (!req.user || !req.user.isAdmin) {
=======
    // @ts-ignore
    const user = req.user;
    if (!user || !user.isAdmin) {
>>>>>>> 712e08e47b3b671c3607c286d1d1ad01f8b90805
        return res
            .status(403)
            .json({ message: "Forbidden: admin privileges required" });
    }
    next();
}
