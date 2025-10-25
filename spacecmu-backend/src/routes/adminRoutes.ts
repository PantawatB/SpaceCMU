import { Router, RequestHandler } from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import {
  listReports,
  reviewReport,
  banPersona,
  banUser,
  takedownPost,
} from "../controllers/adminController";

const router = Router();

/**
 * 🔒 Routes in this file:
 * - ต้อง login ก่อน (authenticateToken)
 * - ต้องเป็น admin เท่านั้น (requireAdmin)
 */
router.use(authenticateToken as RequestHandler);
router.use(requireAdmin as RequestHandler);

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

// 📌 Takedown a post
// POST /api/admin/post/:postId/takedown
router.post("/post/:postId/takedown", takedownPost);

export default router;
