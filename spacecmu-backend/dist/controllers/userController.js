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
exports.register = register;
exports.login = login;
exports.getMe = getMe;
const ormconfig_1 = require("../ormconfig");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../entities/User");
const hash_1 = require("../utils/hash");
/**
 * Registers a new user. This function expects a CMU student ID, CMU email,
 * password and name. It ensures that both student ID and email are unique
 * and creates a new user record with a hashed password.
 */
function register(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { studentId, email, password, name } = req.body;
        if (!studentId || !email || !password || !name) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const userRepo = ormconfig_1.AppDataSource.getRepository(User_1.User);
        const existingById = yield userRepo.findOne({ where: { studentId } });
        if (existingById) {
            return res.status(409).json({ message: "Student ID already registered" });
        }
        const existingByEmail = yield userRepo.findOne({ where: { email } });
        if (existingByEmail) {
            return res.status(409).json({ message: "Email already registered" });
        }
        const hashed = yield (0, hash_1.hashPassword)(password);
        const user = userRepo.create({
            studentId,
            email,
            passwordHash: hashed,
            name,
        });
        yield userRepo.save(user);
        return res.status(201).json({ message: "Registration successful" });
    });
}
/**
 * Authenticates a user by email and password. Returns a signed JWT on success.
 */
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Missing credentials" });
        }
        const userRepo = ormconfig_1.AppDataSource.getRepository(User_1.User);
        const user = yield userRepo.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const isMatch = yield (0, hash_1.comparePassword)(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const secret = process.env.JWT_SECRET || "changeme";
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, secret, { expiresIn: "7d" });
        return res.json({ token });
    });
}
/**
 * Returns the currently authenticated user's profile along with their persona
 * and friend count. Does not reveal private persona details for others.
 */
function getMe(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        const user = req.user;
        // Only include non‑sensitive fields in response
        const { id, studentId, email, name, persona, isAdmin, friends, createdAt, updatedAt, } = user;
        const friendCount = friends ? friends.length : 0;
        return res.json({
            id,
            studentId,
            email,
            name,
            isAdmin,
            friendCount,
            persona,
            createdAt,
            updatedAt,
        });
    });
}
