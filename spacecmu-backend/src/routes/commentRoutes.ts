import { Router } from "express";
import { authenticateToken, checkBanned } from "../middleware/auth";
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

// สร้างคอมเมนต์ (banned users cannot comment)
// POST /api/posts/:postId/comments
router.post(
  "/:postId/comments",
  authenticateToken,
  checkBanned,
  createCommentOnPost
);

// แก้ไขคอมเมนต์ (banned users cannot edit)
// PUT /api/posts/:postId/comments/:commentId
router.put(
  "/:postId/comments/:commentId",
  authenticateToken,
  checkBanned,
  updateComment
);

// ลบคอมเมนต์ (banned users cannot delete)
// DELETE /api/posts/:postId/comments/:commentId
router.delete(
  "/:postId/comments/:commentId",
  authenticateToken,
  checkBanned,
  deleteComment
);

export default router;
