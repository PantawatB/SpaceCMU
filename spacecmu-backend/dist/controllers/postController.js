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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPost = createPost;
exports.getPublicFeed = getPublicFeed;
exports.getFriendFeed = getFriendFeed;
exports.getPostById = getPostById;
const ormconfig_1 = require("../ormconfig");
const typeorm_1 = require("typeorm");
const Post_1 = require("../entities/Post");
/**
 * Creates a new post. Supports both public and friend‑only visibility as well
 * as anonymous posting via the user's persona. Anonymous posts require the
 * user to have at least 10 friends.
 */
function createPost(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        const user = req.user;
        const { content, imageUrl, isAnonymous, visibility } = req.body;
        if (!content || typeof content !== "string" || content.trim().length === 0) {
            return res.status(400).json({ message: "Post content is required" });
        }
        const vis = visibility === "friends" ? "friends" : "public";
        const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
        let persona = null;
        if (isAnonymous) {
            // Must have a persona and at least 10 friends
            if (!user.persona) {
                return res
                    .status(400)
                    .json({
                    message: "You must create a persona before posting anonymously",
                });
            }
            const friendCount = user.friends ? user.friends.length : 0;
            const MIN_FRIENDS_TO_POST_ANON = 10;
            if (friendCount < MIN_FRIENDS_TO_POST_ANON) {
                return res
                    .status(403)
                    .json({
                    message: `You need at least ${MIN_FRIENDS_TO_POST_ANON} friends to post anonymously`,
                });
            }
            persona = user.persona;
        }
        const post = postRepo.create({
            user,
            persona,
            content,
            imageUrl,
            isAnonymous: !!isAnonymous,
            visibility: vis,
        });
        yield postRepo.save(post);
        return res.status(201).json({ message: "Post created", post });
    });
}
/**
 * Returns the global feed containing public posts. Does not require
 * authentication. Only displays persona details when posts are anonymous.
 */
function getPublicFeed(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
        const posts = yield postRepo.find({
            where: { visibility: "public" },
            relations: ["user", "persona"],
            order: { createdAt: "DESC" },
            take: 50,
        });
        const result = posts.map((post) => {
            let author;
            if (post.isAnonymous && post.persona) {
                author = {
                    name: post.persona.displayName,
                    avatarUrl: post.persona.avatarUrl,
                };
            }
            else {
                author = { name: post.user.name };
            }
            return {
                id: post.id,
                content: post.content,
                imageUrl: post.imageUrl,
                visibility: post.visibility,
                isAnonymous: post.isAnonymous,
                createdAt: post.createdAt,
                author,
            };
        });
        return res.json(result);
    });
}
/**
 * Returns the friend feed for the authenticated user. Includes posts authored
 * by the user and by their friends. Both public and friend‑only posts are
 * included.
 */
function getFriendFeed(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        const user = req.user;
        const friendIds = user.friends ? user.friends.map((f) => f.id) : [];
        const ids = [...friendIds, user.id];
        const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
        const posts = yield postRepo.find({
            where: { user: { id: (0, typeorm_1.In)(ids) }, visibility: (0, typeorm_1.In)(["public", "friends"]) },
            relations: ["user", "persona"],
            order: { createdAt: "DESC" },
            take: 50,
        });
        const result = posts.map((post) => {
            let author;
            if (post.isAnonymous && post.persona) {
                author = {
                    name: post.persona.displayName,
                    avatarUrl: post.persona.avatarUrl,
                };
            }
            else {
                author = { name: post.user.name };
            }
            return {
                id: post.id,
                content: post.content,
                imageUrl: post.imageUrl,
                visibility: post.visibility,
                isAnonymous: post.isAnonymous,
                createdAt: post.createdAt,
                author,
            };
        });
        return res.json(result);
    });
}
/**
 * Retrieves a single post by ID. Returns persona or user name accordingly.
 */
function getPostById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = req.params;
        const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
        const post = yield postRepo.findOne({
            where: { id },
            relations: ["user", "persona"],
        });
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        let author;
        if (post.isAnonymous && post.persona) {
            author = {
                name: post.persona.displayName,
                avatarUrl: post.persona.avatarUrl,
            };
        }
        else {
            author = { name: post.user.name };
        }
        return res.json({
            id: post.id,
            content: post.content,
            imageUrl: post.imageUrl,
            visibility: post.visibility,
            isAnonymous: post.isAnonymous,
            createdAt: post.createdAt,
            author,
        });
    });
}
