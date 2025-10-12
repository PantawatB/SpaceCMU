import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
  createCommentOnPost,
  listCommentsForPost,
  deleteComment,
  updateComment,
} from "../controllers/commentController";

const router = Router();

// ดึงรายการคอมเมนต์
// GET /api/posts/:postId/comments
router.get("/:postId/comments", listCommentsForPost);

// สร้างคอมเมนต์
// POST /api/posts/:postId/comments
router.post("/:postId/comments", authenticateToken, createCommentOnPost);

// แก้ไขคอมเมนต์
// PUT /api/posts/:postId/comments/:commentId
router.put("/:postId/comments/:commentId", authenticateToken, updateComment);

// ลบคอมเมนต์
// DELETE /api/posts/:postId/comments/:commentId
router.delete("/:postId/comments/:commentId", authenticateToken, deleteComment);

export default router;
