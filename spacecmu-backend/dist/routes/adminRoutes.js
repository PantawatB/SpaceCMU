"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const adminController_1 = require("../controllers/adminController");
const router = (0, express_1.Router)();
// All routes in this file require authentication and admin privileges
router.use(auth_1.authenticateToken);
router.use(auth_1.requireAdmin);
router.get('/reports', adminController_1.listReports);
router.post('/report/:reportId/review', adminController_1.reviewReport);
router.post('/persona/:personaId/ban', adminController_1.banPersona);
router.post('/user/:userId/ban', adminController_1.banUser);
router.post('/post/:postId/takedown', adminController_1.takedownPost);
exports.default = router;
