import { Router, RequestHandler } from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import {
  createAppeal,
  getMyAppeals,
  listAppeals,
  approveAppeal,
  rejectAppeal,
} from "../controllers/appealController";

const router = Router();

// User routes (banned users can appeal)
router.post(
  "/",
  authenticateToken as RequestHandler,
  createAppeal as RequestHandler
);
router.get(
  "/my",
  authenticateToken as RequestHandler,
  getMyAppeals as RequestHandler
);

// Admin routes
router.get(
  "/",
  authenticateToken as RequestHandler,
  requireAdmin as RequestHandler,
  listAppeals as RequestHandler
);
router.post(
  "/:appealId/approve",
  authenticateToken as RequestHandler,
  requireAdmin as RequestHandler,
  approveAppeal as RequestHandler
);
router.post(
  "/:appealId/reject",
  authenticateToken as RequestHandler,
  requireAdmin as RequestHandler,
  rejectAppeal as RequestHandler
);

export default router;
