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
} from "../controllers/postController";

const router = Router();

// ต้อง login ก่อนถึงจะโพสต์/กดไลก์ได้
router.use(authenticateToken);

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

export default router;
