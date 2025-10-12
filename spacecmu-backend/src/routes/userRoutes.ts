import { Router } from "express";
import {
  register,
  login,
  getMe,
  updateUser,
  searchUsers,
  getMyReposts,
  getMyLikedPosts,
  getMySavedPosts,
  listAllUsers,
} from "../controllers/userController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// GET /api/users/search?name=...
router.get("/search", authenticateToken, searchUsers);

// Protected routes
router.get("/me", authenticateToken, getMe);

// PUT /api/users/me
router.put("/me", authenticateToken, updateUser);

// GET /api/users/me/reposts
router.get("/me/reposts", authenticateToken, getMyReposts);

// GET /api/users/me/likes
router.get("/me/likes", authenticateToken, getMyLikedPosts);

// GET /api/users/me/saved
router.get("/me/saved", authenticateToken, getMySavedPosts);

// GET /api/users/all
router.get("/all", authenticateToken, listAllUsers);

export default router;
