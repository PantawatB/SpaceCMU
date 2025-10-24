import { Router } from "express";
import {
  register,
  login,
  getMe,
  getCurrentUserActor,
  updateUser,
  searchUsers,
  resolveUserActorMapping,
  getRepostsByActor,
  getLikedPostsByActor,
  getSavedPostsByActor,
  listAllUsers,
} from "../controllers/userController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// GET /api/users/search?name=...
router.get("/search", authenticateToken, searchUsers);

// GET /api/users/resolve?id=...&actorId=... (debug endpoint)
router.get("/resolve", authenticateToken, resolveUserActorMapping);

// Protected routes
router.get("/me", authenticateToken, getMe);
router.get("/me/actor", authenticateToken, getCurrentUserActor);

// PUT /api/users/me
router.put("/me", authenticateToken, updateUser);

// GET /api/users/actor/:actorId/reposts
router.get("/actor/:actorId/reposts", authenticateToken, getRepostsByActor);

// GET /api/users/actor/:actorId/likes
router.get("/actor/:actorId/likes", authenticateToken, getLikedPostsByActor);

// GET /api/users/actor/:actorId/saved
router.get("/actor/:actorId/saved", authenticateToken, getSavedPostsByActor);

// GET /api/users/all
router.get("/all", authenticateToken, listAllUsers);

export default router;
