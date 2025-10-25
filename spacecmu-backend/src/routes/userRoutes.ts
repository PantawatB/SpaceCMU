import { Router, RequestHandler } from "express";
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
router.get(
  "/search",
  authenticateToken as RequestHandler,
  searchUsers as RequestHandler
);

// GET /api/users/resolve?id=...&actorId=... (debug endpoint)
router.get(
  "/resolve",
  authenticateToken as RequestHandler,
  resolveUserActorMapping as RequestHandler
);

// Protected routes
router.get("/me", authenticateToken as RequestHandler, getMe as RequestHandler);
router.get(
  "/me/actor",
  authenticateToken as RequestHandler,
  getCurrentUserActor as RequestHandler
);

// PUT /api/users/me
router.put(
  "/me",
  authenticateToken as RequestHandler,
  updateUser as RequestHandler
);

// GET /api/users/actor/:actorId/reposts
router.get(
  "/actor/:actorId/reposts",
  authenticateToken as RequestHandler,
  getRepostsByActor as RequestHandler
);

// GET /api/users/actor/:actorId/likes
router.get(
  "/actor/:actorId/likes",
  authenticateToken as RequestHandler,
  getLikedPostsByActor as RequestHandler
);

// GET /api/users/actor/:actorId/saved
router.get(
  "/actor/:actorId/saved",
  authenticateToken as RequestHandler,
  getSavedPostsByActor as RequestHandler
);

// GET /api/users/all
router.get(
  "/all",
  authenticateToken as RequestHandler,
  listAllUsers as RequestHandler
);

export default router;
