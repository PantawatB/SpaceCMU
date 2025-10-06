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
<<<<<<< HEAD
exports.updateUser = updateUser;
exports.getMyReposts = getMyReposts;
exports.getMyLikedPosts = getMyLikedPosts;
exports.getMySavedPosts = getMySavedPosts;
=======
>>>>>>> 712e08e47b3b671c3607c286d1d1ad01f8b90805
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
<<<<<<< HEAD
        try {
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
        }
        catch (err) {
            console.error("Register error:", err);
            return res.status(500).json({ message: "Registration failed" });
        }
=======
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
>>>>>>> 712e08e47b3b671c3607c286d1d1ad01f8b90805
    });
}
/**
 * Authenticates a user by email and password. Returns a signed JWT on success.
 */
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
<<<<<<< HEAD
        try {
            console.log("Request body:", req.body); // Debug log
            const { email, studentId, password } = req.body;
            // Support both email and studentId login
            if ((!email && !studentId) || !password) {
                console.log("Missing credentials - email:", email, "studentId:", studentId, "password:", password ? "***" : "undefined");
                return res.status(400).json({ message: "Missing credentials" });
            }
            const userRepo = ormconfig_1.AppDataSource.getRepository(User_1.User);
            // Find user by email or studentId
            const whereCondition = email ? { email } : { studentId };
            const user = yield userRepo.findOne({ where: whereCondition });
            if (!user) {
                return res.status(401).json({ message: "Invalid credentials" });
            }
            const isMatch = yield (0, hash_1.comparePassword)(password, user.passwordHash);
            if (!isMatch) {
                return res.status(401).json({ message: "Invalid credentials" });
            }
            const secret = process.env.JWT_SECRET || "changeme";
            const token = jsonwebtoken_1.default.sign({ userId: user.id }, secret, { expiresIn: "7d" });
            return res.json({
                message: "Login successful",
                token,
                user: {
                    id: user.id,
                    studentId: user.studentId,
                    email: user.email,
                    name: user.name,
                    bio: user.bio,
                    isAdmin: user.isAdmin,
                },
            });
        }
        catch (err) {
            console.error("Login error:", err);
            return res.status(500).json({ message: "Login failed" });
        }
    });
}
/**
 * Returns the currently authenticated user's profile.
 */
function getMe(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            const friendCount = user.friends ? user.friends.length : 0;
            return res.json({
                id: user.id,
                studentId: user.studentId,
                email: user.email,
                name: user.name,
                bio: user.bio,
                isAdmin: user.isAdmin,
                friendCount,
                persona: user.persona || null,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            });
        }
        catch (err) {
            console.error("GetMe error:", err);
            return res.status(500).json({ message: "Failed to fetch user profile" });
        }
    });
}
/**
 * Updates basic user info (e.g., name, password).
 */
function updateUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            const { name, password, bio } = req.body;
            const userRepo = ormconfig_1.AppDataSource.getRepository(User_1.User);
            if (name) {
                user.name = name;
            }
            if (password) {
                user.passwordHash = yield (0, hash_1.hashPassword)(password);
            }
            if (typeof bio === "string") {
                user.bio = bio;
            }
            yield userRepo.save(user);
            return res.json({
                message: "User updated successfully",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    studentId: user.studentId,
                    bio: user.bio,
                },
            });
        }
        catch (err) {
            console.error("UpdateUser error:", err);
            return res.status(500).json({ message: "Failed to update user" });
        }
    });
}
/**
 * 📌 ดึงรายการโพสต์ที่ user คนปัจจุบันเคย Repost
 */
function getMyReposts(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            if (!user)
                return res.status(401).json({ message: "Unauthorized" });
            const userRepo = ormconfig_1.AppDataSource.getRepository(User_1.User);
            const userWithReposts = yield userRepo.findOne({
                where: { id: user.id },
                relations: [
                    "repostedPosts",
                    "repostedPosts.user",
                    "repostedPosts.persona",
                ],
            });
            if (!userWithReposts) {
                return res.status(404).json({ message: "User not found" });
            }
            return res.json(userWithReposts.repostedPosts || []);
        }
        catch (err) {
            console.error("getMyReposts error:", err);
            return res.status(500).json({ message: "Failed to fetch reposts" });
        }
    });
}
/**
 * 📌 ดึงรายการโพสต์ที่ user คนปัจจุบันเคย Like
 */
function getMyLikedPosts(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            if (!user)
                return res.status(401).json({ message: "Unauthorized" });
            const userRepo = ormconfig_1.AppDataSource.getRepository(User_1.User);
            const userWithLikes = yield userRepo.findOne({
                where: { id: user.id },
                relations: ["likedPosts", "likedPosts.user", "likedPosts.persona"],
            });
            if (!userWithLikes) {
                return res.status(404).json({ message: "User not found" });
            }
            return res.json(userWithLikes.likedPosts || []);
        }
        catch (err) {
            console.error("getMyLikedPosts error:", err);
            return res.status(500).json({ message: "Failed to fetch liked posts" });
        }
    });
}
/**
 * 📌 ดึงรายการโพสต์ที่ user คนปัจจุบันเคย Save
 */
function getMySavedPosts(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            if (!user)
                return res.status(401).json({ message: "Unauthorized" });
            const userRepo = ormconfig_1.AppDataSource.getRepository(User_1.User);
            const userWithSaves = yield userRepo.findOne({
                where: { id: user.id },
                relations: ["savedPosts", "savedPosts.user", "savedPosts.persona"],
            });
            if (!userWithSaves) {
                return res.status(404).json({ message: "User not found" });
            }
            return res.json(userWithSaves.savedPosts || []);
        }
        catch (err) {
            console.error("getMySavedPosts error:", err);
            return res.status(500).json({ message: "Failed to fetch saved posts" });
        }
=======
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
>>>>>>> 712e08e47b3b671c3607c286d1d1ad01f8b90805
    });
}
