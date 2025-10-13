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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPost = createPost;
exports.updatePost = updatePost;
exports.deletePost = deletePost;
exports.listPosts = listPosts;
exports.getPost = getPost;
exports.getPublicFeed = getPublicFeed;
exports.getFriendFeed = getFriendFeed;
exports.getPostById = getPostById;
exports.likePost = likePost;
exports.undoLikePost = undoLikePost;
exports.repostPost = repostPost;
exports.undoRepost = undoRepost;
exports.savePost = savePost;
exports.unsavePost = unsavePost;
exports.searchPostsByAuthor = searchPostsByAuthor;
const ormconfig_1 = require("../ormconfig");
const typeorm_1 = require("typeorm");
const Post_1 = require("../entities/Post");
const serialize_1 = require("../utils/serialize");
/**
 * 📌 สร้างโพสต์ใหม่
 */
function createPost(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            if (!user)
                return res.status(401).json({ message: "Unauthorized" });
            const { content, imageUrl, isAnonymous, visibility, location } = req.body;
            if (!content ||
                typeof content !== "string" ||
                content.trim().length === 0) {
                return res.status(400).json({ message: "Post content is required" });
            }
            const vis = visibility === "friends" ? "friends" : "public";
            let persona = null;
            if (isAnonymous) {
                if (!user.persona) {
                    return res.status(400).json({
                        message: "You must create a persona before posting anonymously",
                    });
                }
                const friendCount = user.actor && user.actor.friends ? user.actor.friends.length : 0;
                const MIN_FRIENDS_TO_POST_ANON = 10;
                if (friendCount < MIN_FRIENDS_TO_POST_ANON) {
                    return res.status(403).json({
                        message: `You need at least ${MIN_FRIENDS_TO_POST_ANON} friends to post anonymously`,
                    });
                }
                persona = user.persona;
            }
            const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
            const post = postRepo.create({
                user,
                persona,
                content,
                imageUrl,
                isAnonymous: !!isAnonymous,
                visibility: vis,
                location,
            });
            yield postRepo.save(post);
            // sanitize author before returning
            const postToReturn = Object.assign(Object.assign({}, post), { user: (0, serialize_1.sanitizeUser)(post.user) });
            return res
                .status(201)
                .json((0, serialize_1.createResponse)("Post created", { post: postToReturn }));
        }
        catch (err) {
            console.error("createPost error:", err);
            return res.status(500).json({ message: "Failed to create post" });
        }
    });
}
/**
 * 📌 อัปเดตโพสต์
 */
function updatePost(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { postId } = req.params;
            const { content, imageUrl, location } = req.body;
            const user = req.user;
            const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
            const post = yield postRepo.findOne({
                where: { id: postId },
                relations: ["user"],
            });
            if (!post)
                return res.status(404).json({ message: "Post not found" });
            if (!user || post.user.id !== user.id) {
                return res.status(403).json({ message: "Not authorized" });
            }
            if (content)
                post.content = content;
            if (imageUrl)
                post.imageUrl = imageUrl;
            if (typeof location !== "undefined") {
                post.location = location;
            }
            yield postRepo.save(post);
            const postToReturn = Object.assign(Object.assign({}, post), { user: (0, serialize_1.sanitizeUser)(post.user) });
            return res.json((0, serialize_1.createResponse)("Post updated", { post: postToReturn }));
        }
        catch (err) {
            console.error("updatePost error:", err);
            return res.status(500).json({ message: "Failed to update post" });
        }
    });
}
/**
 * 📌 ลบโพสต์
 */
function deletePost(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { postId } = req.params;
            const user = req.user;
            const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
            const post = yield postRepo.findOne({
                where: { id: postId },
                relations: ["user"],
            });
            if (!post)
                return res.status(404).json({ message: "Post not found" });
            if (!user || post.user.id !== user.id) {
                return res.status(403).json({ message: "Not authorized" });
            }
            yield postRepo.remove(post);
            return res.json((0, serialize_1.createResponse)("Post deleted", null));
        }
        catch (err) {
            console.error("deletePost error:", err);
            return res.status(500).json({ message: "Failed to delete post" });
        }
    });
}
/**
 * 📌 ดึงโพสต์ทั้งหมด (ใช้สำหรับ list)
 */
function listPosts(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
            const posts = yield postRepo.find({
                relations: ["user", "persona"],
                order: { createdAt: "DESC" },
                take: 50,
            });
            // sanitize user for each post unless anonymous
            const sanitized = posts.map((p) => {
                if (p.isAnonymous && p.persona)
                    return p;
                return Object.assign(Object.assign({}, p), { user: (0, serialize_1.sanitizeUser)(p.user) });
            });
            return res.json((0, serialize_1.listResponse)(sanitized));
        }
        catch (err) {
            console.error("listPosts error:", err);
            return res.status(500).json({ message: "Failed to fetch posts" });
        }
    });
}
/**
 * 📌 ดึงโพสต์เดียว (frontend เรียกใช้ getPost)
 */
function getPost(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { postId } = req.params;
            const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
            const post = yield postRepo.findOne({
                where: { id: postId },
                relations: ["user", "persona"],
            });
            if (!post)
                return res.status(404).json({ message: "Post not found" });
            const postToReturn = Object.assign(Object.assign({}, post), { user: post.isAnonymous && post.persona ? undefined : (0, serialize_1.sanitizeUser)(post.user) });
            return res.json((0, serialize_1.createResponse)("Post fetched", { post: postToReturn }));
        }
        catch (err) {
            console.error("getPost error:", err);
            return res.status(500).json({ message: "Failed to fetch post" });
        }
    });
}
/**
 * 📌 Feed สาธารณะ (แบบมี Pagination)
 */
function getPublicFeed(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;
            const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
            const [posts, totalItems] = yield postRepo.findAndCount({
                where: { visibility: "public" },
                relations: ["user", "persona"],
                order: { createdAt: "DESC" },
                take: limit,
                skip: skip,
            });
            const items = posts.map((post) => {
                const author = post.isAnonymous && post.persona
                    ? {
                        name: post.persona.displayName,
                        avatarUrl: post.persona.avatarUrl,
                    }
                    : { name: post.user.name };
                const { user, persona } = post, restOfPost = __rest(post, ["user", "persona"]);
                return Object.assign(Object.assign({}, restOfPost), { author });
            });
            const totalPages = Math.ceil(totalItems / limit);
            return res.json((0, serialize_1.createResponse)("Public feed fetched", {
                items: items,
                meta: {
                    totalItems,
                    itemCount: items.length,
                    itemsPerPage: limit,
                    totalPages,
                    currentPage: page,
                },
            }));
        }
        catch (err) {
            console.error("getPublicFeed error:", err);
            return res.status(500).json({ message: "Failed to fetch public feed" });
        }
    });
}
/**
 * 📌 Feed เพื่อน (แบบมี Pagination)
 */
function getFriendFeed(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            if (!user)
                return res.status(401).json({ message: "Unauthorized" });
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;
            const friendIds = user.actor && user.actor.friends
                ? user.actor.friends.map((f) => f.id)
                : [];
            const ids = [...friendIds, user.id];
            const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
            const [posts, totalItems] = yield postRepo.findAndCount({
                where: { user: { id: (0, typeorm_1.In)(ids) }, visibility: (0, typeorm_1.In)(["public", "friends"]) },
                relations: ["user", "persona"],
                order: { createdAt: "DESC" },
                take: limit,
                skip: skip,
            });
            const items = posts.map((post) => {
                const author = post.isAnonymous && post.persona
                    ? {
                        name: post.persona.displayName,
                        avatarUrl: post.persona.avatarUrl,
                    }
                    : { name: post.user.name };
                const { user, persona } = post, restOfPost = __rest(post, ["user", "persona"]);
                return Object.assign(Object.assign({}, restOfPost), { author });
            });
            const totalPages = Math.ceil(totalItems / limit);
            return res.json((0, serialize_1.createResponse)("Friend feed fetched", {
                items: items,
                meta: {
                    totalItems,
                    itemCount: items.length,
                    itemsPerPage: limit,
                    totalPages,
                    currentPage: page,
                },
            }));
        }
        catch (err) {
            console.error("getFriendFeed error:", err);
            return res.status(500).json({ message: "Failed to fetch friend feed" });
        }
    });
}
/**
 * 📌 ดึงโพสต์ตาม ID
 */
function getPostById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
            const post = yield postRepo.findOne({
                where: { id },
                relations: ["user", "persona"],
            });
            if (!post)
                return res.status(404).json({ message: "Post not found" });
            const postToReturn = Object.assign(Object.assign({}, post), { user: post.isAnonymous && post.persona ? undefined : (0, serialize_1.sanitizeUser)(post.user) });
            return res.json((0, serialize_1.createResponse)("Post fetched", { post: postToReturn }));
        }
        catch (err) {
            console.error("getPostById error:", err);
            return res.status(500).json({ message: "Failed to fetch post" });
        }
    });
}
/**
 * 📌 กด like โพสต์
 */
function likePost(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { postId } = req.params;
            const user = req.user;
            if (!user)
                return res.status(401).json({ message: "Unauthorized" });
            const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
            const post = yield postRepo.findOne({
                where: { id: postId },
                relations: ["likedBy"],
            });
            if (!post)
                return res.status(404).json({ message: "Post not found" });
            if (!post.likedBy)
                post.likedBy = [];
            if (post.likedBy.some((u) => u.id === user.id)) {
                return res.status(400).json({ message: "You already liked this post" });
            }
            post.likedBy.push(user);
            yield postRepo.save(post);
            return res.json({ message: "Post liked" });
        }
        catch (err) {
            console.error("likePost error:", err);
            return res.status(500).json({ message: "Failed to like post" });
        }
    });
}
/**
 * 📌 ยกเลิก Like โพสต์
 */
function undoLikePost(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { postId } = req.params;
            const user = req.user;
            if (!user)
                return res.status(401).json({ message: "Unauthorized" });
            const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
            const post = yield postRepo.findOne({
                where: { id: postId },
                relations: ["likedBy"],
            });
            if (!post)
                return res.status(404).json({ message: "Post not found" });
            post.likedBy = post.likedBy.filter((u) => u.id !== user.id);
            yield postRepo.save(post);
            return res.json({ message: "Like undone" });
        }
        catch (err) {
            console.error("undoLikePost error:", err);
            return res.status(500).json({ message: "Failed to undo like" });
        }
    });
}
/**
 * 📌 Repost โพสต์
 */
function repostPost(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { postId } = req.params;
            const user = req.user;
            if (!user)
                return res.status(401).json({ message: "Unauthorized" });
            const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
            const post = yield postRepo.findOne({
                where: { id: postId },
                relations: ["repostedBy"],
            });
            if (!post)
                return res.status(404).json({ message: "Post not found" });
            if (!post.repostedBy)
                post.repostedBy = [];
            // เช็คว่าเคย Repost ไปแล้วหรือยัง
            if (post.repostedBy.some((u) => u.id === user.id)) {
                return res
                    .status(400)
                    .json({ message: "You already reposted this post" });
            }
            post.repostedBy.push(user);
            yield postRepo.save(post);
            return res.json({ message: "Post reposted" });
        }
        catch (err) {
            console.error("repostPost error:", err);
            return res.status(500).json({ message: "Failed to repost post" });
        }
    });
}
/**
 * 📌 ยกเลิก Repost
 */
function undoRepost(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { postId } = req.params;
            const user = req.user;
            if (!user)
                return res.status(401).json({ message: "Unauthorized" });
            const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
            const post = yield postRepo.findOne({
                where: { id: postId },
                relations: ["repostedBy"],
            });
            if (!post)
                return res.status(404).json({ message: "Post not found" });
            post.repostedBy = post.repostedBy.filter((u) => u.id !== user.id);
            yield postRepo.save(post);
            return res.json({ message: "Repost undone" });
        }
        catch (err) {
            console.error("undoRepost error:", err);
            return res.status(500).json({ message: "Failed to undo repost" });
        }
    });
}
/**
 * 📌 Save โพสต์
 */
function savePost(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { postId } = req.params;
            const user = req.user;
            if (!user)
                return res.status(401).json({ message: "Unauthorized" });
            const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
            const post = yield postRepo.findOne({
                where: { id: postId },
                relations: ["savedBy"],
            });
            if (!post)
                return res.status(404).json({ message: "Post not found" });
            if (!post.savedBy)
                post.savedBy = [];
            if (post.savedBy.some((u) => u.id === user.id)) {
                return res.status(400).json({ message: "You already saved this post" });
            }
            post.savedBy.push(user);
            yield postRepo.save(post);
            return res.json({ message: "Post saved" });
        }
        catch (err) {
            console.error("savePost error:", err);
            return res.status(500).json({ message: "Failed to save post" });
        }
    });
}
/**
 * 📌 ยกเลิก Save โพสต์
 */
function unsavePost(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { postId } = req.params;
            const user = req.user;
            if (!user)
                return res.status(401).json({ message: "Unauthorized" });
            const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
            const post = yield postRepo.findOne({
                where: { id: postId },
                relations: ["savedBy"],
            });
            if (!post)
                return res.status(404).json({ message: "Post not found" });
            post.savedBy = post.savedBy.filter((u) => u.id !== user.id);
            yield postRepo.save(post);
            return res.json({ message: "Post unsaved" });
        }
        catch (err) {
            console.error("unsavePost error:", err);
            return res.status(500).json({ message: "Failed to unsave post" });
        }
    });
}
/**
 * 📌 ค้นหาโพสต์จากชื่อผู้เขียน (Author)
 */
function searchPostsByAuthor(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { authorName } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;
            if (!authorName || typeof authorName !== "string") {
                return res.status(400).json({ message: "authorName query is required" });
            }
            const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
            const [posts, totalItems] = yield postRepo
                .createQueryBuilder("post")
                .innerJoinAndSelect("post.user", "author") // 1. เชื่อมตาราง post กับ user
                .where("author.name ILIKE :name", { name: `%${authorName}%` }) // 2. ค้นหาแบบไม่สนตัวพิมพ์เล็ก/ใหญ่
                .orderBy("post.createdAt", "DESC")
                .skip(skip)
                .take(limit)
                .getManyAndCount(); // 3. ดึงข้อมูลพร้อมนับจำนวนทั้งหมด
            const totalPages = Math.ceil(totalItems / limit);
            return res.json({
                items: posts,
                meta: {
                    totalItems,
                    itemCount: posts.length,
                    itemsPerPage: limit,
                    totalPages,
                    currentPage: page,
                },
            });
        }
        catch (err) {
            console.error("searchPostsByAuthor error:", err);
            return res.status(500).json({ message: "Failed to search posts" });
        }
    });
}
