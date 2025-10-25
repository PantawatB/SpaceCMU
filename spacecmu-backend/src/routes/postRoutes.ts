import { Router } from "express";
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
router.get("/search", searchPostsByAuthor);
router.get("/feed/public", getPublicFeed);
router.get("/", listPosts);

// 📌 Protected endpoints (ต้อง login)
// Feed ของเพื่อน
router.get("/feed/friends/:actorId", authenticateToken, getFriendFeed);

// 📌 Get posts by actor
router.get("/actor/:actorId", authenticateToken, getPostsByActor);

// 📌 Get single post (must be after specific routes)
router.get("/:id", getPost);

// สร้าง/แก้ไข/ลบโพสต์ (banned users cannot do these)
router.post("/", authenticateToken, checkBanned, createPost);
router.put("/:id", authenticateToken, checkBanned, updatePost);
router.delete("/:id", authenticateToken, checkBanned, deletePost);

// การโต้ตอบ (like, repost, save) - banned users cannot interact
router.post("/:id/like", authenticateToken, checkBanned, likePost);
router.delete("/:id/like", authenticateToken, checkBanned, undoLikePost);
router.post("/:id/repost", authenticateToken, checkBanned, repostPost);
router.delete("/:id/repost", authenticateToken, checkBanned, undoRepost);
router.post("/:id/save", authenticateToken, checkBanned, savePost);
router.delete("/:id/save", authenticateToken, checkBanned, unsavePost);

// GET /api/posts/:id/likers - ดูรายชื่อคนไลค์
router.get("/:id/likers", getPostLikers);

// GET /api/posts/:id/reposters - ดูรายชื่อคนรีโพสต์
router.get("/:id/reposters", getPostReposters);

// GET /api/posts/:id/savers - ดูรายชื่อคนเซฟ (ต้องเป็นเจ้าของโพสต์)
router.get("/:id/savers", authenticateToken, getPostSavers);

// POST /api/posts/:postId/report - รายงานโพสต์
router.post("/:postId/report", authenticateToken, reportPost);

export default router;
