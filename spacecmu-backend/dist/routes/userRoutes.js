"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
<<<<<<< HEAD
router.post("/register", userController_1.register);
router.post("/login", userController_1.login);
// Protected routes
router.get("/me", auth_1.authenticateToken, userController_1.getMe);
// PUT /api/users/me
router.put("/me", auth_1.authenticateToken, userController_1.updateUser);
// GET /api/users/me/reposts
router.get("/me/reposts", auth_1.authenticateToken, userController_1.getMyReposts);
// GET /api/users/me/likes
router.get("/me/likes", auth_1.authenticateToken, userController_1.getMyLikedPosts);
// GET /api/users/me/saved
router.get("/me/saved", auth_1.authenticateToken, userController_1.getMySavedPosts);
=======
router.post('/register', userController_1.register);
router.post('/login', userController_1.login);
// Protected route to fetch current user
router.get('/me', auth_1.authenticateToken, userController_1.getMe);
>>>>>>> 712e08e47b3b671c3607c286d1d1ad01f8b90805
exports.default = router;
