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
exports.likePost = likePost;
exports.undoLikePost = undoLikePost;
exports.repostPost = repostPost;
exports.undoRepost = undoRepost;
exports.savePost = savePost;
exports.unsavePost = unsavePost;
exports.searchPostsByAuthor = searchPostsByAuthor;
exports.getPostLikers = getPostLikers;
exports.getPostReposters = getPostReposters;
exports.getPostSavers = getPostSavers;
const ormconfig_1 = require("../ormconfig");
const Post_1 = require("../entities/Post");
const Actor_1 = require("../entities/Actor");
const serialize_1 = require("../utils/serialize");
/**
 * 📌 สร้างโพสต์ใหม่ (เวอร์ชันใหม่ อ้างอิงจาก Actor)
 */
function createPost(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
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
            let authorActor;
            if (isAnonymous) {
                if (!user.persona || !user.persona.actor) {
                    return res.status(400).json({
                        message: "You must have a persona to post anonymously",
                    });
                }
                const friendCount = ((_b = (_a = user.actor) === null || _a === void 0 ? void 0 : _a.friends) === null || _b === void 0 ? void 0 : _b.length) || 0;
                const MIN_FRIENDS_TO_POST_ANON = 10;
                if (friendCount < MIN_FRIENDS_TO_POST_ANON) {
                    return res.status(403).json({
                        message: `You need at least ${MIN_FRIENDS_TO_POST_ANON} friends to post anonymously`,
                    });
                }
                authorActor = user.persona.actor;
            }
            else {
                if (!user.actor)
                    return res
                        .status(400)
                        .json({ message: "User actor profile not found" });
                authorActor = user.actor;
            }
            const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
            const post = postRepo.create({
                actor: authorActor,
                content,
                imageUrl,
                visibility: vis,
                location,
            });
            yield postRepo.save(post);
            const postToReturn = Object.assign(Object.assign({}, post), { actor: {
                    id: post.actor.id,
                    type: post.actor.persona ? "persona" : "user",
                    name: post.actor.persona ? post.actor.persona.displayName : user.name,
                }, likeCount: 0, repostCount: 0, saveCount: 0 });
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
        var _a;
        try {
            const { postId } = req.params;
            const { content, imageUrl, location } = req.body;
            const user = req.user;
            const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
            const post = yield postRepo.findOne({
                where: { id: postId },
                relations: ["actor"],
            });
            if (!post)
                return res.status(404).json({ message: "Post not found" });
            const isOwner = ((user === null || user === void 0 ? void 0 : user.actor) && post.actor.id === user.actor.id) ||
                (((_a = user === null || user === void 0 ? void 0 : user.persona) === null || _a === void 0 ? void 0 : _a.actor) && post.actor.id === user.persona.actor.id);
            if (!isOwner) {
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
            return res.json((0, serialize_1.createResponse)("Post updated", { post }));
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
        var _a;
        try {
            const { postId } = req.params;
            const user = req.user;
            const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
            const post = yield postRepo.findOne({
                where: { id: postId },
                relations: ["actor"],
            });
            if (!post)
                return res.status(404).json({ message: "Post not found" });
            const isOwner = ((user === null || user === void 0 ? void 0 : user.actor) && post.actor.id === user.actor.id) ||
                (((_a = user === null || user === void 0 ? void 0 : user.persona) === null || _a === void 0 ? void 0 : _a.actor) && post.actor.id === user.persona.actor.id);
            if (!isOwner) {
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
            const posts = yield postRepo
                .createQueryBuilder("post")
                .leftJoinAndSelect("post.actor", "actor")
                .leftJoinAndSelect("actor.user", "user")
                .leftJoinAndSelect("actor.persona", "persona")
                .loadRelationCountAndMap("post.likeCount", "post.likedBy")
                .loadRelationCountAndMap("post.repostCount", "post.repostedBy")
                .loadRelationCountAndMap("post.saveCount", "post.savedBy")
                .orderBy("post.createdAt", "DESC")
                .take(50)
                .getMany();
            const items = posts.map((post) => {
                const author = post.actor.persona
                    ? {
                        name: post.actor.persona.displayName,
                        avatarUrl: post.actor.persona.avatarUrl,
                    }
                    : {
                        name: post.actor.user.name,
                        profileImg: post.actor.user.profileImg,
                    };
                const { actor } = post, restOfPost = __rest(post, ["actor"]);
                return Object.assign(Object.assign({}, restOfPost), { author, actorId: actor.id });
            });
            return res.json({ data: items });
        }
        catch (err) {
            console.error("listPosts error:", err);
            return res.status(500).json({ message: "Failed to fetch posts" });
        }
    });
}
/**
 * 📌 ดึงโพสต์เดียว
 */
function getPost(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
            const post = yield postRepo.findOne({
                where: { id },
                relations: ["actor", "actor.user", "actor.persona"],
            });
            if (!post)
                return res.status(404).json({ message: "Post not found" });
            return res.json((0, serialize_1.createResponse)("Post fetched", { post }));
        }
        catch (err) {
            console.error("getPost error:", err);
            return res.status(500).json({ message: "Failed to fetch post" });
        }
    });
}
/**
 * 📌 Feed สาธารณะ (แบบ Cursor-based Pagination)
 */
function getPublicFeed(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
            const posts = yield postRepo
                .createQueryBuilder("post")
                .leftJoinAndSelect("post.actor", "actor")
                .leftJoinAndSelect("actor.user", "user")
                .leftJoinAndSelect("actor.persona", "persona")
                .loadRelationCountAndMap("post.likeCount", "post.likedBy")
                .loadRelationCountAndMap("post.repostCount", "post.repostedBy")
                .loadRelationCountAndMap("post.saveCount", "post.savedBy")
                .where("post.visibility = :visibility", { visibility: "public" })
                .orderBy("post.createdAt", "DESC")
                .addOrderBy("post.id", "DESC")
                .getMany();
            const items = posts.map((post) => {
                const author = post.actor.persona
                    ? {
                        name: post.actor.persona.displayName,
                        avatarUrl: post.actor.persona.avatarUrl,
                    }
                    : {
                        name: post.actor.user.name,
                        profileImg: post.actor.user.profileImg,
                    };
                const { actor } = post, restOfPost = __rest(post, ["actor"]);
                return Object.assign(Object.assign({}, restOfPost), { author, actorId: actor.id });
            });
            return res.json((0, serialize_1.listResponse)(items));
        }
        catch (err) {
            console.error("getPublicFeed error:", err);
            return res.status(500).json({ message: "Failed to fetch public feed" });
        }
    });
}
/**
 * 📌 Feed เพื่อน (แบบ Cursor-based Pagination)
 */
function getFriendFeed(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        try {
            const currentUser = req.user;
            const { actorId } = req.params;
            if (!currentUser || !currentUser.actor) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            if (!actorId) {
                return res.status(400).json({ message: "Actor ID is required" });
            }
            const actorRepo = ormconfig_1.AppDataSource.getRepository(Actor_1.Actor);
            const targetActor = yield actorRepo.findOne({
                where: { id: actorId },
                relations: ["friends"],
            });
            if (!targetActor) {
                return res.status(404).json({ message: "Target actor not found" });
            }
            const isOwner = currentUser.actor.id === targetActor.id ||
                ((_b = (_a = currentUser.persona) === null || _a === void 0 ? void 0 : _a.actor) === null || _b === void 0 ? void 0 : _b.id) === targetActor.id;
            const isFriend = (_c = currentUser.actor.friends) === null || _c === void 0 ? void 0 : _c.some((friend) => friend.id === targetActor.id);
            if (!isOwner && !isFriend) {
                return res.status(403).json({
                    message: "You can only view the feed of your friends or your own.",
                });
            }
            const targetActorIds = [targetActor.id];
            const friendActorIds = ((_d = targetActor.friends) === null || _d === void 0 ? void 0 : _d.map((f) => f.id)) || [];
            const visibleActorIds = [...targetActorIds, ...friendActorIds];
            if (visibleActorIds.length === 0) {
                return res.json((0, serialize_1.listResponse)([]));
            }
            const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
            const posts = yield postRepo
                .createQueryBuilder("post")
                .leftJoinAndSelect("post.actor", "actor")
                .leftJoinAndSelect("actor.user", "user")
                .leftJoinAndSelect("actor.persona", "persona")
                .loadRelationCountAndMap("post.likeCount", "post.likedBy")
                .loadRelationCountAndMap("post.repostCount", "post.repostedBy")
                .loadRelationCountAndMap("post.saveCount", "post.savedBy")
                .where("actor.id IN (:...visibleActorIds)", { visibleActorIds })
                .andWhere(" (post.visibility = 'public' OR (post.visibility = 'friends' AND actor.id IN (:...friendActorIdsWithTarget))) ", { friendActorIdsWithTarget: visibleActorIds })
                .orderBy("post.createdAt", "DESC")
                .getMany();
            const items = posts.map((post) => {
                const author = post.actor.persona
                    ? {
                        name: post.actor.persona.displayName,
                        avatarUrl: post.actor.persona.avatarUrl,
                    }
                    : {
                        name: post.actor.user.name,
                        profileImg: post.actor.user.profileImg,
                    };
                const { actor } = post, restOfPost = __rest(post, ["actor"]);
                return Object.assign(Object.assign({}, restOfPost), { author, actorId: actor.id });
            });
            return res.json((0, serialize_1.listResponse)(items));
        }
        catch (err) {
            console.error("getFriendFeed error:", err);
            return res.status(500).json({ message: "Failed to fetch friend feed" });
        }
    });
}
/**
 * 📌 กด like โพสต์
 */
function likePost(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            const { id: postId } = req.params;
            const { actorId } = req.body;
            const user = req.user;
            if (!user)
                return res.status(401).json({ message: "Unauthorized" });
            if (!actorId) {
                return res.status(400).json({ message: "actorId is required" });
            }
            const isOwnerOfActor = ((_a = user.actor) === null || _a === void 0 ? void 0 : _a.id) === actorId || ((_c = (_b = user.persona) === null || _b === void 0 ? void 0 : _b.actor) === null || _c === void 0 ? void 0 : _c.id) === actorId;
            if (!isOwnerOfActor) {
                return res
                    .status(403)
                    .json({ message: "Not authorized to perform action with this actor" });
            }
            const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
            const actorRepo = ormconfig_1.AppDataSource.getRepository(Actor_1.Actor);
            const post = yield postRepo.findOne({
                where: { id: postId },
                relations: ["likedBy"],
            });
            if (!post)
                return res.status(404).json({ message: "Post not found" });
            const actor = yield actorRepo.findOneBy({ id: actorId });
            if (!actor)
                return res.status(404).json({ message: "Actor not found" });
            if (!post.likedBy)
                post.likedBy = [];
            if (post.likedBy.some((act) => act.id === actorId)) {
                return res
                    .status(400)
                    .json({ message: "You already liked this post with this actor" });
            }
            post.likedBy.push(actor);
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
            const { id: postId } = req.params;
            const { actorId } = req.body;
            const user = req.user;
            if (!user)
                return res.status(401).json({ message: "Unauthorized" });
            if (!actorId) {
                return res.status(400).json({ message: "actorId is required" });
            }
            const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
            const post = yield postRepo.findOne({
                where: { id: postId },
                relations: ["likedBy"],
            });
            if (!post)
                return res.status(404).json({ message: "Post not found" });
            post.likedBy = post.likedBy.filter((act) => act.id !== actorId);
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
        var _a, _b, _c;
        try {
            const { id: postId } = req.params;
            const { actorId } = req.body;
            const user = req.user;
            if (!user)
                return res.status(401).json({ message: "Unauthorized" });
            if (!actorId) {
                return res.status(400).json({ message: "actorId is required" });
            }
            const isOwnerOfActor = ((_a = user.actor) === null || _a === void 0 ? void 0 : _a.id) === actorId || ((_c = (_b = user.persona) === null || _b === void 0 ? void 0 : _b.actor) === null || _c === void 0 ? void 0 : _c.id) === actorId;
            if (!isOwnerOfActor) {
                return res
                    .status(403)
                    .json({ message: "Not authorized to perform action with this actor" });
            }
            const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
            const actorRepo = ormconfig_1.AppDataSource.getRepository(Actor_1.Actor);
            const post = yield postRepo.findOne({
                where: { id: postId },
                relations: ["repostedBy"],
            });
            if (!post)
                return res.status(404).json({ message: "Post not found" });
            const actor = yield actorRepo.findOneBy({ id: actorId });
            if (!actor)
                return res.status(404).json({ message: "Actor not found" });
            if (!post.repostedBy)
                post.repostedBy = [];
            if (post.repostedBy.some((act) => act.id === actorId)) {
                return res
                    .status(400)
                    .json({ message: "You already reposted this post with this actor" });
            }
            post.repostedBy.push(actor);
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
            const { id: postId } = req.params;
            const { actorId } = req.body;
            const user = req.user;
            if (!user)
                return res.status(401).json({ message: "Unauthorized" });
            if (!actorId) {
                return res.status(400).json({ message: "actorId is required" });
            }
            const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
            const post = yield postRepo.findOne({
                where: { id: postId },
                relations: ["repostedBy"],
            });
            if (!post)
                return res.status(404).json({ message: "Post not found" });
            post.repostedBy = post.repostedBy.filter((act) => act.id !== actorId);
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
        var _a, _b, _c;
        try {
            const { id: postId } = req.params;
            const { actorId } = req.body;
            const user = req.user;
            if (!user)
                return res.status(401).json({ message: "Unauthorized" });
            if (!actorId) {
                return res.status(400).json({ message: "actorId is required" });
            }
            const isOwnerOfActor = ((_a = user.actor) === null || _a === void 0 ? void 0 : _a.id) === actorId || ((_c = (_b = user.persona) === null || _b === void 0 ? void 0 : _b.actor) === null || _c === void 0 ? void 0 : _c.id) === actorId;
            if (!isOwnerOfActor) {
                return res
                    .status(403)
                    .json({ message: "Not authorized to perform action with this actor" });
            }
            const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
            const actorRepo = ormconfig_1.AppDataSource.getRepository(Actor_1.Actor);
            const post = yield postRepo.findOne({
                where: { id: postId },
                relations: ["savedBy"],
            });
            if (!post)
                return res.status(404).json({ message: "Post not found" });
            const actor = yield actorRepo.findOneBy({ id: actorId });
            if (!actor)
                return res.status(404).json({ message: "Actor not found" });
            if (!post.savedBy)
                post.savedBy = [];
            if (post.savedBy.some((act) => act.id === actorId)) {
                return res
                    .status(400)
                    .json({ message: "You already saved this post with this actor" });
            }
            post.savedBy.push(actor);
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
            const { id: postId } = req.params;
            const { actorId } = req.body;
            const user = req.user;
            if (!user)
                return res.status(401).json({ message: "Unauthorized" });
            if (!actorId) {
                return res.status(400).json({ message: "actorId is required" });
            }
            const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
            const post = yield postRepo.findOne({
                where: { id: postId },
                relations: ["savedBy"],
            });
            if (!post)
                return res.status(404).json({ message: "Post not found" });
            post.savedBy = post.savedBy.filter((act) => act.id !== actorId);
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
                .leftJoinAndSelect("post.actor", "actor")
                .leftJoin("actor.user", "user_author")
                .leftJoin("actor.persona", "persona_author")
                .where("user_author.name ILIKE :name OR persona_author.displayName ILIKE :name", { name: `%${authorName}%` })
                .orderBy("post.createdAt", "DESC")
                .skip(skip)
                .take(limit)
                .getManyAndCount();
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
const sanitizeActorList = (actors) => {
    if (!actors)
        return [];
    return actors
        .map((actor) => {
        if (actor.user) {
            return {
                actorId: actor.id,
                type: "user",
                name: actor.user.name,
                profileImg: actor.user.profileImg,
            };
        }
        if (actor.persona) {
            return {
                actorId: actor.id,
                type: "persona",
                name: actor.persona.displayName,
                avatarUrl: actor.persona.avatarUrl,
            };
        }
        return null;
    })
        .filter(Boolean);
};
/**
 * 📌 Get a list of actors who liked a specific post.
 */
function getPostLikers(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id: postId } = req.params;
            const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
            const post = yield postRepo.findOne({
                where: { id: postId },
                relations: ["likedBy", "likedBy.user", "likedBy.persona"],
            });
            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }
            const sanitizedLikers = sanitizeActorList(post.likedBy);
            return res.json({ data: sanitizedLikers });
        }
        catch (err) {
            console.error("getPostLikers error:", err);
            return res.status(500).json({ message: "Failed to get post likers" });
        }
    });
}
/**
 * 📌 Get a list of actors who reposted a specific post.
 */
function getPostReposters(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id: postId } = req.params;
            const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
            const post = yield postRepo.findOne({
                where: { id: postId },
                relations: ["repostedBy", "repostedBy.user", "repostedBy.persona"],
            });
            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }
            const sanitizedReposters = sanitizeActorList(post.repostedBy);
            return res.json({ data: sanitizedReposters });
        }
        catch (err) {
            console.error("getPostReposters error:", err);
            return res.status(500).json({ message: "Failed to get post reposters" });
        }
    });
}
/**
 * 📌 Get a list of actors who saved a specific post.
 */
function getPostSavers(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const { id: postId } = req.params;
            const user = req.user;
            if (!user)
                return res.status(401).json({ message: "Unauthorized" });
            const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
            const post = yield postRepo.findOne({
                where: { id: postId },
                relations: [
                    "savedBy",
                    "savedBy.user",
                    "savedBy.persona",
                    "actor",
                    "actor.user",
                    "actor.persona",
                ],
            });
            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }
            const isOwner = ((_a = post.actor.user) === null || _a === void 0 ? void 0 : _a.id) === user.id ||
                ((_b = post.actor.persona) === null || _b === void 0 ? void 0 : _b.user.id) === user.id;
            if (!isOwner) {
                return res.status(403).json({
                    message: "You are not authorized to see who saved this post.",
                });
            }
            const sanitizedSavers = sanitizeActorList(post.savedBy);
            return res.json({ data: sanitizedSavers });
        }
        catch (err) {
            console.error("getPostSavers error:", err);
            return res.status(500).json({ message: "Failed to get post savers" });
        }
    });
}
