import { Router } from "express";
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
router.post("/", authenticateToken, createAppeal);
router.get("/my", authenticateToken, getMyAppeals);

// Admin routes
router.get("/", authenticateToken, requireAdmin, listAppeals);
router.post(
  "/:appealId/approve",
  authenticateToken,
  requireAdmin,
  approveAppeal
);
router.post("/:appealId/reject", authenticateToken, requireAdmin, rejectAppeal);

export default router;
