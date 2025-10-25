import { Router } from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import {
  listReports,
  reviewReport,
  banPersona,
  banUser,
  unbanUser,
  takedownPost,
  promoteToAdmin,
  revokeAdmin,
  deleteUser,
} from "../controllers/adminController";

const router = Router();

/**
 * 🔒 Routes in this file:
 * - ต้อง login ก่อน (authenticateToken)
 * - ต้องเป็น admin เท่านั้น (requireAdmin)
 */
router.use(authenticateToken);
router.use(requireAdmin);

// 📌 GET all reports
// GET /api/admin/reports
router.get("/reports", listReports);

// 📌 Review a report
// POST /api/admin/report/:reportId/review
router.post("/report/:reportId/review", reviewReport);

// 📌 Ban a persona
// POST /api/admin/persona/:personaId/ban
router.post("/persona/:personaId/ban", banPersona);

// 📌 Ban a user
// POST /api/admin/user/:userId/ban
router.post("/user/:userId/ban", banUser);

// 📌 Unban a user
// POST /api/admin/user/:userId/unban
router.post("/user/:userId/unban", unbanUser);

// 📌 Takedown a post
// POST /api/admin/post/:postId/takedown
router.post("/post/:postId/takedown", takedownPost);

// 📌 Promote user to admin
// POST /api/admin/user/:userId/promote
router.post("/user/:userId/promote", promoteToAdmin);

// 📌 Revoke admin privileges
// POST /api/admin/user/:userId/revoke
router.post("/user/:userId/revoke", revokeAdmin);

// 📌 Delete user
// DELETE /api/admin/user/:userId
router.delete("/user/:userId", deleteUser);

export default router;
