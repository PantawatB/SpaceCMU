"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const adminController_1 = require("../controllers/adminController");
const router = (0, express_1.Router)();
<<<<<<< HEAD
/**
 * 🔒 Routes in this file:
 * - ต้อง login ก่อน (authenticateToken)
 * - ต้องเป็น admin เท่านั้น (requireAdmin)
 */
router.use(auth_1.authenticateToken);
router.use(auth_1.requireAdmin);
// 📌 GET all reports
// GET /api/admin/reports
router.get("/reports", adminController_1.listReports);
// 📌 Review a report
// POST /api/admin/report/:reportId/review
router.post("/report/:reportId/review", adminController_1.reviewReport);
// 📌 Ban a persona
// POST /api/admin/persona/:personaId/ban
router.post("/persona/:personaId/ban", adminController_1.banPersona);
// 📌 Ban a user
// POST /api/admin/user/:userId/ban
router.post("/user/:userId/ban", adminController_1.banUser);
// 📌 Takedown a post
// POST /api/admin/post/:postId/takedown
router.post("/post/:postId/takedown", adminController_1.takedownPost);
=======
// All routes in this file require authentication and admin privileges
router.use(auth_1.authenticateToken);
router.use(auth_1.requireAdmin);
router.get('/reports', adminController_1.listReports);
router.post('/report/:reportId/review', adminController_1.reviewReport);
router.post('/persona/:personaId/ban', adminController_1.banPersona);
router.post('/user/:userId/ban', adminController_1.banUser);
router.post('/post/:postId/takedown', adminController_1.takedownPost);
>>>>>>> 712e08e47b3b671c3607c286d1d1ad01f8b90805
exports.default = router;
