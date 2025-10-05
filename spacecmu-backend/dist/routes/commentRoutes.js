"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const commentController_1 = require("../controllers/commentController");
const router = (0, express_1.Router)();
// ดึงรายการคอมเมนต์
// GET /api/posts/:postId/comments
router.get("/:postId/comments", commentController_1.listCommentsForPost);
// สร้างคอมเมนต์
// POST /api/posts/:postId/comments
router.post("/:postId/comments", auth_1.authenticateToken, commentController_1.createCommentOnPost);
// ลบคอมเมนต์
// DELETE /api/posts/:postId/comments/:commentId
router.delete("/:postId/comments/:commentId", auth_1.authenticateToken, commentController_1.deleteComment);
exports.default = router;
