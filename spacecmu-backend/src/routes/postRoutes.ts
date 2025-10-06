import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
  createPost,
  updatePost,
  deletePost,
  getPost,
  listPosts,
  likePost,
  unlikePost,
  repostPost,
  undoRepost,
  savePost,
  unsavePost,
  getPublicFeed,
  getFriendFeed,
} from "../controllers/postController";

const router = Router();

// ต้อง login ก่อนถึงจะโพสต์/กดไลก์ได้
router.use(authenticateToken);

// 📌 Feed สาธารณะ (Global)
// GET /api/posts/feed/public
router.get("/feed/public", getPublicFeed);

// 📌 Feed ของเพื่อน
// GET /api/posts/feed/friends
router.get("/feed/friends", getFriendFeed);

// 📌 สร้างโพสต์
// POST /api/posts
router.post("/", createPost);

// 📌 อัพเดทโพสต์
// PUT /api/posts/:id
router.put("/:id", updatePost);

// 📌 ลบโพสต์
// DELETE /api/posts/:id
router.delete("/:id", deletePost);

// 📌 ดูโพสต์ทั้งหมด
// GET /api/posts
router.get("/", listPosts);

// 📌 ดูโพสต์เดียว
// GET /api/posts/:id
router.get("/:id", getPost);

// 📌 กด like
// POST /api/posts/:id/like
router.post("/:id/like", likePost);

// 📌 ยกเลิก like
// POST /api/posts/:id/unlike
router.post("/:id/unlike", unlikePost);

// 📌 กด Repost
// POST /api/posts/:id/repost
router.post("/:id/repost", repostPost);

// 📌 ยกเลิก Repost
// DELETE /api/posts/:id/repost
router.delete("/:id/repost", undoRepost);

// 📌 Save Post
// POST /api/posts/:id/save
router.post("/:id/save", savePost);

// 📌 Unsave Post
// DELETE /api/posts/:id/save
router.delete("/:id/save", unsavePost);

export default router;
