import { Router, RequestHandler } from "express";
import { authenticateToken, checkBanned } from "../middleware/auth";
import {
  createPost,
  updatePost,
  deletePost,
  getPost,
  listPosts,
  likePost,
  undoLikePost,
  repostPost,
  undoRepost,
  savePost,
  unsavePost,
  getPublicFeed,
  getFriendFeed,
  searchPostsByAuthor,
  getPostLikers,
  getPostReposters,
  getPostSavers,
  getPostsByActor,
  reportPost,
} from "../controllers/postController";

const router = Router();

// 📌 Public endpoints (ไม่ต้อง login)
router.get("/search", searchPostsByAuthor as RequestHandler);
router.get("/feed/public", getPublicFeed as RequestHandler);
router.get("/", listPosts as RequestHandler);

// 📌 Protected endpoints (ต้อง login)
// Feed ของเพื่อน
router.get(
  "/feed/friends/:actorId",
  authenticateToken as RequestHandler,
  getFriendFeed as RequestHandler
);

// 📌 Get posts by actor
router.get(
  "/actor/:actorId",
  authenticateToken as RequestHandler,
  getPostsByActor as RequestHandler
);

// 📌 Get single post (must be after specific routes)
router.get("/:id", getPost);

// สร้าง/แก้ไข/ลบโพสต์
router.post(
  "/",
  authenticateToken as RequestHandler,
  checkBanned as RequestHandler,
  createPost as RequestHandler
);
router.put(
  "/:id",
  authenticateToken as RequestHandler,
  checkBanned as RequestHandler,
  updatePost as RequestHandler
);
router.delete(
  "/:id",
  authenticateToken as RequestHandler,
  deletePost as RequestHandler
);

// การโต้ตอบ (like, repost, save)
router.post(
  "/:id/like",
  authenticateToken as RequestHandler,
  checkBanned as RequestHandler,
  likePost as RequestHandler
);
router.delete(
  "/:id/like",
  authenticateToken as RequestHandler,
  checkBanned as RequestHandler,
  undoLikePost as RequestHandler
);
router.post(
  "/:id/repost",
  authenticateToken as RequestHandler,
  checkBanned as RequestHandler,
  repostPost as RequestHandler
);
router.delete(
  "/:id/repost",
  authenticateToken as RequestHandler,
  checkBanned as RequestHandler,
  undoRepost as RequestHandler
);
router.post(
  "/:id/save",
  authenticateToken as RequestHandler,
  checkBanned as RequestHandler,
  savePost as RequestHandler
);
router.delete(
  "/:id/save",
  authenticateToken as RequestHandler,
  checkBanned as RequestHandler,
  unsavePost as RequestHandler
);

// GET /api/posts/:id/likers - ดูรายชื่อคนไลค์
router.get("/:id/likers", getPostLikers as RequestHandler);

// GET /api/posts/:id/reposters - ดูรายชื่อคนรีโพสต์
router.get("/:id/reposters", getPostReposters as RequestHandler);

// GET /api/posts/:id/savers - ดูรายชื่อคนเซฟ (ต้องเป็นเจ้าของโพสต์)
router.get(
  "/:id/savers",
  authenticateToken as RequestHandler,
  getPostSavers as RequestHandler
);

// POST /api/posts/:id/report - Report a post
router.post(
  "/:id/report",
  authenticateToken as RequestHandler,
  reportPost as RequestHandler
);

export default router;
