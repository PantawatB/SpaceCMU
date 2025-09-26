"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const postController_1 = require("../controllers/postController");
const router = (0, express_1.Router)();
// Public endpoint to fetch global feed
router.get('/feed/public', postController_1.getPublicFeed);
// Protected endpoint to fetch friend feed
router.get('/feed/friends', auth_1.authenticateToken, postController_1.getFriendFeed);
// Protected endpoint to create a post
router.post('/', auth_1.authenticateToken, postController_1.createPost);
// Public endpoint to fetch a specific post by id
router.get('/:id', postController_1.getPostById);
exports.default = router;
