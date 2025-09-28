import { Router } from "express";
import {
  register,
  login,
  getMe,
  updateUser,
} from "../controllers/userController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/me", authenticateToken, getMe);

// PUT /api/users/me
router.put("/me", authenticateToken, updateUser);

export default router;
