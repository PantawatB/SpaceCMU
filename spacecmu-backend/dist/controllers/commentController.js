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
exports.createCommentOnPost = createCommentOnPost;
exports.listCommentsForPost = listCommentsForPost;
exports.deleteComment = deleteComment;
const ormconfig_1 = require("../ormconfig");
const Post_1 = require("../entities/Post");
const Comment_1 = require("../entities/Comment");
/**
 * 📌 สร้างคอมเมนต์ใหม่ใต้โพสต์
 */
function createCommentOnPost(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { postId } = req.params;
            const { content } = req.body;
            const user = req.user;
            if (!user)
                return res.status(401).json({ message: "Unauthorized" });
            if (!content)
                return res.status(400).json({ message: "Content is required" });
            const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
            const post = yield postRepo.findOneBy({ id: postId });
            if (!post)
                return res.status(404).json({ message: "Post not found" });
            const commentRepo = ormconfig_1.AppDataSource.getRepository(Comment_1.Comment);
            const newComment = commentRepo.create({
                content,
                user,
                post,
            });
            yield commentRepo.save(newComment);
            return res.status(201).json(newComment);
        }
        catch (err) {
            console.error("createCommentOnPost error:", err);
            return res.status(500).json({ message: "Failed to create comment" });
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
                relations: ["user"],
                order: { createdAt: "ASC" },
            });
            return res.json(comments);
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
        try {
            const { commentId } = req.params;
            const user = req.user;
            if (!user)
                return res.status(401).json({ message: "Unauthorized" });
            const commentRepo = ormconfig_1.AppDataSource.getRepository(Comment_1.Comment);
            const comment = yield commentRepo.findOne({
                where: { id: commentId },
                relations: ["user"],
            });
            if (!comment)
                return res.status(404).json({ message: "Comment not found" });
            if (comment.user.id !== user.id && !user.isAdmin) {
                return res
                    .status(403)
                    .json({ message: "Not authorized to delete this comment" });
            }
            yield commentRepo.remove(comment);
            return res.status(200).json({ message: "Comment deleted" });
        }
        catch (err) {
            console.error("deleteComment error:", err);
            return res.status(500).json({ message: "Failed to delete comment" });
        }
    });
}
