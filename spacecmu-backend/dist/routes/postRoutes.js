"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const postController_1 = require("../controllers/postController");
const router = (0, express_1.Router)();
// 📌 Public endpoints (ไม่ต้อง login)
router.get("/search", postController_1.searchPostsByAuthor);
router.get("/feed/public", postController_1.getPublicFeed);
router.get("/", postController_1.listPosts);
// 📌 Protected endpoints (ต้อง login)
// Feed ของเพื่อน
router.get("/feed/friends/:actorId", auth_1.authenticateToken, postController_1.getFriendFeed);
// 📌 Get single post (must be after specific routes)
router.get("/:id", postController_1.getPost);
// สร้าง/แก้ไข/ลบโพสต์
router.post("/", auth_1.authenticateToken, postController_1.createPost);
router.put("/:id", auth_1.authenticateToken, postController_1.updatePost);
router.delete("/:id", auth_1.authenticateToken, postController_1.deletePost);
// การโต้ตอบ (like, repost, save)
router.post("/:id/like", auth_1.authenticateToken, postController_1.likePost);
router.delete("/:id/like", auth_1.authenticateToken, postController_1.undoLikePost);
router.post("/:id/repost", auth_1.authenticateToken, postController_1.repostPost);
router.delete("/:id/repost", auth_1.authenticateToken, postController_1.undoRepost);
router.post("/:id/save", auth_1.authenticateToken, postController_1.savePost);
router.delete("/:id/save", auth_1.authenticateToken, postController_1.unsavePost);
// GET /api/posts/:id/likers - ดูรายชื่อคนไลค์
router.get("/:id/likers", postController_1.getPostLikers);
// GET /api/posts/:id/reposters - ดูรายชื่อคนรีโพสต์
router.get("/:id/reposters", postController_1.getPostReposters);
// GET /api/posts/:id/savers - ดูรายชื่อคนเซฟ (ต้องเป็นเจ้าของโพสต์)
router.get("/:id/savers", auth_1.authenticateToken, postController_1.getPostSavers);
exports.default = router;
