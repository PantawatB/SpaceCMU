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
exports.createCommentOnPost = createCommentOnPost;
exports.updateComment = updateComment;
exports.listCommentsForPost = listCommentsForPost;
exports.deleteComment = deleteComment;
const ormconfig_1 = require("../ormconfig");
const Post_1 = require("../entities/Post");
const Comment_1 = require("../entities/Comment");
const Actor_1 = require("../entities/Actor");
const serialize_1 = require("../utils/serialize");
/**
 * 📌 สร้างคอมเมนต์ใหม่ใต้โพสต์
 */
function createCommentOnPost(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            const { postId } = req.params;
            const { content, actorId } = req.body;
            const user = req.user;
            if (!user)
                return res.status(401).json({ message: "Unauthorized" });
            if (!content)
                return res.status(400).json({ message: "Content is required" });
            if (!actorId)
                return res.status(400).json({ message: "actorId is required" });
            const isOwnerOfActor = ((_a = user.actor) === null || _a === void 0 ? void 0 : _a.id) === actorId || ((_c = (_b = user.persona) === null || _b === void 0 ? void 0 : _b.actor) === null || _c === void 0 ? void 0 : _c.id) === actorId;
            if (!isOwnerOfActor) {
                return res
                    .status(403)
                    .json({ message: "Not authorized to comment with this actor" });
            }
            const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
            const post = yield postRepo.findOneBy({ id: postId });
            if (!post)
                return res.status(404).json({ message: "Post not found" });
            const actorRepo = ormconfig_1.AppDataSource.getRepository(Actor_1.Actor);
            const actor = yield actorRepo.findOneBy({ id: actorId });
            if (!actor)
                return res.status(404).json({ message: "Actor not found" });
            const commentRepo = ormconfig_1.AppDataSource.getRepository(Comment_1.Comment);
            const newComment = commentRepo.create({
                content,
                actor,
                post,
            });
            yield commentRepo.save(newComment);
            return res
                .status(201)
                .json((0, serialize_1.createResponse)("Comment created", { comment: newComment }));
        }
        catch (err) {
            console.error("createCommentOnPost error:", err);
            return res.status(500).json({ message: "Failed to create comment" });
        }
    });
}
/**
 * 📌 แก้ไขคอมเมนต์
 */
function updateComment(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            const { commentId } = req.params;
            const { content } = req.body;
            const user = req.user;
            if (!user)
                return res.status(401).json({ message: "Unauthorized" });
            if (!content)
                return res.status(400).json({ message: "Content is required" });
            const commentRepo = ormconfig_1.AppDataSource.getRepository(Comment_1.Comment);
            const comment = yield commentRepo.findOne({
                where: { id: commentId },
                relations: ["actor"],
            });
            if (!comment) {
                return res.status(404).json({ message: "Comment not found" });
            }
            const isOwnerOfActor = ((_a = user.actor) === null || _a === void 0 ? void 0 : _a.id) === comment.actor.id ||
                ((_c = (_b = user.persona) === null || _b === void 0 ? void 0 : _b.actor) === null || _c === void 0 ? void 0 : _c.id) === comment.actor.id;
            if (!isOwnerOfActor) {
                return res
                    .status(403)
                    .json({ message: "Not authorized to edit this comment" });
            }
            comment.content = content;
            yield commentRepo.save(comment);
            return res.json(comment);
        }
        catch (err) {
            console.error("updateComment error:", err);
            return res.status(500).json({ message: "Failed to update comment" });
        }
    });
}
/**
 * 📌 ดึงคอมเมนต์ทั้งหมดของโพสต์
 */
function listCommentsForPost(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { postId } = req.params;
            const commentRepo = ormconfig_1.AppDataSource.getRepository(Comment_1.Comment);
            const comments = yield commentRepo.find({
                where: { post: { id: postId } },
                relations: ["actor", "actor.user", "actor.persona"],
                order: { createdAt: "ASC" },
            });
            const sanitized = comments.map((comment) => {
                const { actor } = comment, restOfComment = __rest(comment, ["actor"]);
                const author = actor.user
                    ? {
                        type: "user",
                        actorId: actor.id,
                        name: actor.user.name,
                        profileImg: actor.user.profileImg,
                    }
                    : {
                        type: "persona",
                        actorId: actor.id,
                        name: actor.persona.displayName,
                        avatarUrl: actor.persona.avatarUrl,
                    };
                return Object.assign(Object.assign({}, restOfComment), { author });
            });
            return res.json((0, serialize_1.listResponse)(sanitized));
        }
        catch (err) {
            console.error("listCommentsForPost error:", err);
            return res.status(500).json({ message: "Failed to fetch comments" });
        }
    });
}
/**
 * 📌 ลบคอมเมนต์
 */
function deleteComment(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            const { commentId } = req.params;
            const user = req.user;
            if (!user)
                return res.status(401).json({ message: "Unauthorized" });
            const commentRepo = ormconfig_1.AppDataSource.getRepository(Comment_1.Comment);
            const comment = yield commentRepo.findOne({
                where: { id: commentId },
                relations: ["actor"],
            });
            if (!comment)
                return res.status(404).json({ message: "Comment not found" });
            const isOwnerOfActor = ((_a = user.actor) === null || _a === void 0 ? void 0 : _a.id) === comment.actor.id ||
                ((_c = (_b = user.persona) === null || _b === void 0 ? void 0 : _b.actor) === null || _c === void 0 ? void 0 : _c.id) === comment.actor.id;
            if (!isOwnerOfActor && !user.isAdmin) {
                return res
                    .status(403)
                    .json({ message: "Not authorized to delete this comment" });
            }
            yield commentRepo.remove(comment);
            return res.status(200).json((0, serialize_1.createResponse)("Comment deleted", null));
        }
        catch (err) {
            console.error("deleteComment error:", err);
            return res.status(500).json({ message: "Failed to delete comment" });
        }
    });
}
