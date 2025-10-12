import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
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
} from "../controllers/postController";

const router = Router();

// 📌 Public endpoints (ไม่ต้อง login)
router.get("/search", searchPostsByAuthor);
router.get("/feed/public", getPublicFeed);
router.get("/", listPosts);

// 📌 Protected endpoints (ต้อง login)
// Feed ของเพื่อน
router.get("/feed/friends", authenticateToken, getFriendFeed);

// 📌 Get single post (must be after specific routes)
router.get("/:id", getPost);

// สร้าง/แก้ไข/ลบโพสต์
router.post("/", authenticateToken, createPost);
router.put("/:id", authenticateToken, updatePost);
router.delete("/:id", authenticateToken, deletePost);

// การโต้ตอบ (like, repost, save)
router.post("/:id/like", authenticateToken, likePost);
router.delete("/:id/like", authenticateToken, undoLikePost);
router.post("/:id/repost", authenticateToken, repostPost);
router.delete("/:id/repost", authenticateToken, undoRepost);
router.post("/:id/save", authenticateToken, savePost);
router.delete("/:id/save", authenticateToken, unsavePost);

export default router;
