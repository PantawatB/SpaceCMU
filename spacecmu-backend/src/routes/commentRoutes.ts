import { Router, RequestHandler } from "express";
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
router.post(
  "/:postId/comments",
  authenticateToken as RequestHandler,
  createCommentOnPost as RequestHandler
);

// แก้ไขคอมเมนต์
// PUT /api/posts/:postId/comments/:commentId
router.put(
  "/:postId/comments/:commentId",
  authenticateToken as RequestHandler,
  updateComment as RequestHandler
);

// ลบคอมเมนต์
// DELETE /api/posts/:postId/comments/:commentId
router.delete(
  "/:postId/comments/:commentId",
  authenticateToken as RequestHandler,
  deleteComment as RequestHandler
);

export default router;
