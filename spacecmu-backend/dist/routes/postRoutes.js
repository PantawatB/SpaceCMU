"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const postController_1 = require("../controllers/postController");
const router = (0, express_1.Router)();
<<<<<<< HEAD
// ต้อง login ก่อนถึงจะโพสต์/กดไลก์ได้
router.use(auth_1.authenticateToken);
// 📌 Feed สาธารณะ (Global)
// GET /api/posts/feed/public
router.get("/feed/public", postController_1.getPublicFeed);
// 📌 Feed ของเพื่อน
// GET /api/posts/feed/friends
router.get("/feed/friends", postController_1.getFriendFeed);
// 📌 สร้างโพสต์
// POST /api/posts
router.post("/", postController_1.createPost);
// 📌 อัพเดทโพสต์
// PUT /api/posts/:id
router.put("/:id", postController_1.updatePost);
// 📌 ลบโพสต์
// DELETE /api/posts/:id
router.delete("/:id", postController_1.deletePost);
// 📌 ดูโพสต์ทั้งหมด
// GET /api/posts
router.get("/", postController_1.listPosts);
// 📌 ดูโพสต์เดียว
// GET /api/posts/:id
router.get("/:id", postController_1.getPost);
// 📌 กด like
// POST /api/posts/:id/like
router.post("/:id/like", postController_1.likePost);
// 📌 ยกเลิก like
// POST /api/posts/:id/unlike
router.post("/:id/unlike", postController_1.unlikePost);
// 📌 กด Repost
// POST /api/posts/:id/repost
router.post("/:id/repost", postController_1.repostPost);
// 📌 ยกเลิก Repost
// DELETE /api/posts/:id/repost
router.delete("/:id/repost", postController_1.undoRepost);
// 📌 Save Post
// POST /api/posts/:id/save
router.post("/:id/save", postController_1.savePost);
// 📌 Unsave Post
// DELETE /api/posts/:id/save
router.delete("/:id/save", postController_1.unsavePost);
=======
// Public endpoint to fetch global feed
router.get('/feed/public', postController_1.getPublicFeed);
// Protected endpoint to fetch friend feed
router.get('/feed/friends', auth_1.authenticateToken, postController_1.getFriendFeed);
// Protected endpoint to create a post
router.post('/', auth_1.authenticateToken, postController_1.createPost);
// Public endpoint to fetch a specific post by id
router.get('/:id', postController_1.getPostById);
>>>>>>> 712e08e47b3b671c3607c286d1d1ad01f8b90805
exports.default = router;
