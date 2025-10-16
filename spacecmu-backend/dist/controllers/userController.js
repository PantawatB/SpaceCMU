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
exports.updateUser = updateUser;
exports.searchUsers = searchUsers;
exports.getMyReposts = getMyReposts;
exports.getMyLikedPosts = getMyLikedPosts;
exports.getCurrentUserActor = getCurrentUserActor;
exports.getMySavedPosts = getMySavedPosts;
exports.listAllUsers = listAllUsers;
const ormconfig_1 = require("../ormconfig");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../entities/User");
const Persona_1 = require("../entities/Persona");
const Actor_1 = require("../entities/Actor");
const Post_1 = require("../entities/Post"); // Import Post entity
const hash_1 = require("../utils/hash");
const serialize_1 = require("../utils/serialize");
const personaGenerator_1 = require("../utils/personaGenerator");
/**
 * Registers a new user. This function expects a CMU student ID, CMU email,
 * password and name. It ensures that both student ID and email are unique
 * and creates a new user record with a hashed password.
 */
function register(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
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
            const userActor = new Actor_1.Actor();
            const personaActor = new Actor_1.Actor();
            const user = userRepo.create({
                studentId,
                email,
                passwordHash: yield (0, hash_1.hashPassword)(password),
                name,
                actor: userActor,
            });
            const newPersona = new Persona_1.Persona();
            newPersona.displayName = (0, personaGenerator_1.generateRandomPersonaName)();
            newPersona.actor = personaActor;
            user.persona = newPersona;
            newPersona.user = user;
            userActor.user = user;
            personaActor.persona = newPersona;
            yield userRepo.save(user);
            return res.status(201).json({ message: "Registration successful" });
        }
        catch (err) {
            console.error("Register error:", err);
            return res.status(500).json({ message: "Registration failed" });
        }
    });
}
/**
 * Authenticates a user by email and password. Returns a signed JWT on success.
 */
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email, studentId, password } = req.body;
            // Support both email and studentId login
            if ((!email && !studentId) || !password) {
                return res.status(400).json({ message: "Missing credentials" });
            }
            const userRepo = ormconfig_1.AppDataSource.getRepository(User_1.User);
            // Find user by email or studentId
            const whereCondition = email ? { email } : { studentId };
            const user = yield userRepo.findOne({
                where: whereCondition,
                relations: ["persona"],
            });
            if (!user) {
                return res.status(401).json({ message: "Invalid credentials" });
            }
            const isMatch = yield (0, hash_1.comparePassword)(password, user.passwordHash);
            if (!isMatch) {
                return res.status(401).json({ message: "Invalid credentials" });
            }
            const secret = process.env.JWT_SECRET || "changeme";
            const token = jsonwebtoken_1.default.sign({ userId: user.id }, secret, { expiresIn: "7d" });
            return res.json((0, serialize_1.createResponse)("Login successful", {
                token,
                user: (0, serialize_1.sanitizeUserProfile)(user),
            }));
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
            // คำนวณ friendCount ของ User หลัก (เหมือนเดิม)
            const friendCount = user.actor && user.actor.friends ? user.actor.friends.length : 0;
            return res.json({
                id: user.id,
                studentId: user.studentId,
                email: user.email,
                name: user.name,
                bio: user.bio,
                isAdmin: user.isAdmin,
                profileImg: user.profileImg,
                bannerImg: user.bannerImg,
                friendCount, // friendCount ของ User หลัก
                actorId: user.actor ? user.actor.id : null,
                persona: user.persona
                    ? {
                        id: user.persona.id,
                        displayName: user.persona.displayName,
                        avatarUrl: user.persona.avatarUrl,
                        bannerImg: user.persona.bannerImg,
                        bio: user.persona.bio,
                        changeCount: user.persona.changeCount,
                        friendCount: user.persona.actor && user.persona.actor.friends
                            ? user.persona.actor.friends.length
                            : 0,
                        lastChangedAt: user.persona.lastChangedAt,
                        isBanned: user.persona.isBanned,
                        actorId: user.persona.actor ? user.persona.actor.id : null,
                    }
                    : null,
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
            const { name, password, bio, profileImg, bannerImg } = req.body;
            const userRepo = ormconfig_1.AppDataSource.getRepository(User_1.User);
            if (name)
                user.name = name;
            if (password)
                user.passwordHash = yield (0, hash_1.hashPassword)(password);
            if (typeof profileImg !== "undefined")
                user.profileImg = profileImg;
            if (typeof bannerImg !== "undefined")
                user.bannerImg = bannerImg;
            if (typeof bio === "string")
                user.bio = bio;
            yield userRepo.save(user);
            return res.json((0, serialize_1.createResponse)("User updated successfully", {
                user: (0, serialize_1.sanitizeUserProfile)(user),
            }));
        }
        catch (err) {
            console.error("UpdateUser error:", err);
            return res.status(500).json({ message: "Failed to update user" });
        }
    });
}
/**
 * 📌 ค้นหาผู้ใช้ทั้งหมดในระบบจากชื่อ (มี Pagination)
 */
function searchUsers(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const currentUser = req.user;
            const { name } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;
            if (!name || typeof name !== "string" || name.trim() === "") {
                return res
                    .status(400)
                    .json({ message: "Search 'name' query is required" });
            }
            const myActorIds = [currentUser.actor.id];
            if ((_a = currentUser.persona) === null || _a === void 0 ? void 0 : _a.actor) {
                myActorIds.push(currentUser.persona.actor.id);
            }
            const actorRepo = ormconfig_1.AppDataSource.getRepository(Actor_1.Actor);
            const qb = actorRepo
                .createQueryBuilder("actor")
                .leftJoinAndSelect("actor.user", "user")
                .leftJoinAndSelect("actor.persona", "persona")
                .where("(user.name ILIKE :name OR persona.displayName ILIKE :name)", {
                name: `%${name}%`,
            })
                .andWhere("actor.id NOT IN (:...myActorIds)", { myActorIds })
                .orderBy("user.name", "ASC")
                .addOrderBy("persona.displayName", "ASC")
                .skip(skip)
                .take(limit);
            const [actors, totalItems] = yield qb.getManyAndCount();
            const results = actors
                .map((actor) => {
                if (actor.user) {
                    return {
                        actorId: actor.id,
                        id: actor.user.id,
                        name: actor.user.name,
                        type: "user",
                        profileImg: actor.user.profileImg,
                        bio: actor.user.bio,
                    };
                }
                if (actor.persona) {
                    return {
                        actorId: actor.id,
                        id: actor.persona.id,
                        name: actor.persona.displayName,
                        type: "persona",
                        profileImg: actor.persona.avatarUrl,
                        bio: actor.persona.bio,
                    };
                }
                return null;
            })
                .filter(Boolean);
            const totalPages = Math.ceil(totalItems / limit);
            return res.json({
                items: results,
                meta: {
                    totalItems,
                    itemCount: results.length,
                    itemsPerPage: limit,
                    totalPages,
                    currentPage: page,
                },
            });
        }
        catch (err) {
            console.error("searchActors error:", err);
            return res.status(500).json({ message: "Failed to search for actors" });
        }
    });
}
/**
 * 📌 ดึงรายการโพสต์ที่ user คนปัจจุบันเคย Repost
 */
function getMyReposts(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            const user = req.user;
            if (!user)
                return res.status(401).json({ message: "Unauthorized" });
            const actorIds = [];
            if ((_a = user.actor) === null || _a === void 0 ? void 0 : _a.id)
                actorIds.push(user.actor.id);
            if ((_c = (_b = user.persona) === null || _b === void 0 ? void 0 : _b.actor) === null || _c === void 0 ? void 0 : _c.id)
                actorIds.push(user.persona.actor.id);
            if (actorIds.length === 0) {
                return res.json({ data: [] });
            }
            const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
            const repostedPosts = yield postRepo
                .createQueryBuilder("post")
                .leftJoinAndSelect("post.actor", "author_actor")
                .leftJoinAndSelect("author_actor.user", "author_user")
                .leftJoinAndSelect("author_actor.persona", "author_persona")
                .innerJoin("post.repostedBy", "reposting_actor")
                .where("reposting_actor.id IN (:...actorIds)", { actorIds })
                .orderBy("post.createdAt", "DESC")
                .getMany();
            return res.json({ data: repostedPosts });
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
        var _a, _b, _c;
        try {
            const user = req.user;
            if (!user)
                return res.status(401).json({ message: "Unauthorized" });
            const actorIds = [];
            if ((_a = user.actor) === null || _a === void 0 ? void 0 : _a.id)
                actorIds.push(user.actor.id);
            if ((_c = (_b = user.persona) === null || _b === void 0 ? void 0 : _b.actor) === null || _c === void 0 ? void 0 : _c.id)
                actorIds.push(user.persona.actor.id);
            if (actorIds.length === 0) {
                return res.json({ data: [] });
            }
            const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
            const likedPosts = yield postRepo
                .createQueryBuilder("post")
                .leftJoinAndSelect("post.actor", "author_actor")
                .leftJoinAndSelect("author_actor.user", "author_user")
                .leftJoinAndSelect("author_actor.persona", "author_persona")
                .innerJoin("post.likedBy", "liking_actor")
                .where("liking_actor.id IN (:...actorIds)", { actorIds })
                .orderBy("post.createdAt", "DESC")
                .getMany();
            return res.json({ data: likedPosts });
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
function getCurrentUserActor(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            const userRepo = ormconfig_1.AppDataSource.getRepository(User_1.User);
            const userWithActor = yield userRepo.findOne({
                where: { id: user.id },
                relations: ["actor", "persona", "persona.actor"],
            });
            if (!userWithActor) {
                return res.status(404).json({ message: "User not found" });
            }
            return res.json((0, serialize_1.createResponse)("Actor information retrieved", {
                userId: userWithActor.id,
                userName: userWithActor.name,
                userActor: userWithActor.actor
                    ? {
                        id: userWithActor.actor.id,
                    }
                    : null,
                personaActor: ((_a = userWithActor.persona) === null || _a === void 0 ? void 0 : _a.actor)
                    ? {
                        id: userWithActor.persona.actor.id,
                        personaId: userWithActor.persona.id,
                        displayName: userWithActor.persona.displayName,
                    }
                    : null,
            }));
        }
        catch (err) {
            console.error("getCurrentUserActor error:", err);
            return res.status(500).json({ message: "Failed to get actor information" });
        }
    });
}
/**
 * 📌 ดึงรายการโพสต์ที่ user คนปัจจุบันเคย Save (พร้อมค้นหาจากชื่อคนโพส)
 */
function getMySavedPosts(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            const user = req.user;
            if (!user)
                return res.status(401).json({ message: "Unauthorized" });
            const actorIds = [];
            if ((_a = user.actor) === null || _a === void 0 ? void 0 : _a.id)
                actorIds.push(user.actor.id);
            if ((_c = (_b = user.persona) === null || _b === void 0 ? void 0 : _b.actor) === null || _c === void 0 ? void 0 : _c.id)
                actorIds.push(user.persona.actor.id);
            if (actorIds.length === 0) {
                return res.json({ data: [] });
            }
            const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
            const savedPosts = yield postRepo
                .createQueryBuilder("post")
                .leftJoinAndSelect("post.actor", "author_actor")
                .leftJoinAndSelect("author_actor.user", "author_user")
                .leftJoinAndSelect("author_actor.persona", "author_persona")
                .innerJoin("post.savedBy", "saving_actor")
                .where("saving_actor.id IN (:...actorIds)", { actorIds })
                .orderBy("post.createdAt", "DESC")
                .getMany();
            return res.json({ data: savedPosts });
        }
        catch (err) {
            console.error("getMySavedPosts error:", err);
            return res.status(500).json({ message: "Failed to fetch saved posts" });
        }
    });
}
/**
 * 📌 ดึงรายชื่อผู้ใช้ทั้งหมดในระบบ
 */
function listAllUsers(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const currentUser = req.user;
            const myActorIds = [currentUser.actor.id];
            if ((_a = currentUser.persona) === null || _a === void 0 ? void 0 : _a.actor) {
                myActorIds.push(currentUser.persona.actor.id);
            }
            const actorRepo = ormconfig_1.AppDataSource.getRepository(Actor_1.Actor);
            const allActors = yield actorRepo
                .createQueryBuilder("actor")
                .leftJoinAndSelect("actor.user", "user")
                .leftJoinAndSelect("actor.persona", "persona")
                .where("actor.id NOT IN (:...myActorIds)", { myActorIds })
                .getMany();
            const results = allActors
                .map((actor) => {
                if (actor.user) {
                    return {
                        actorId: actor.id,
                        name: actor.user.name,
                        type: "user",
                        profileImg: actor.user.profileImg,
                        bio: actor.user.bio,
                    };
                }
                if (actor.persona) {
                    return {
                        actorId: actor.id,
                        name: actor.persona.displayName,
                        type: "persona",
                        profileImg: actor.persona.avatarUrl,
                        bio: actor.persona.bio,
                    };
                }
                return null;
            })
                .filter(Boolean);
            return res.json(results);
        }
        catch (err) {
            console.error("listAllActors error:", err);
            return res.status(500).json({ message: "Failed to fetch actors" });
        }
    });
}
