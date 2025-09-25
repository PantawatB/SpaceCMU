import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { listReports, banPersona, banUser, takedownPost, reviewReport } from '../controllers/adminController';

const router = Router();

// All routes in this file require authentication and admin privileges
router.use(authenticateToken);
router.use(requireAdmin);

router.get('/reports', listReports);
router.post('/report/:reportId/review', reviewReport);
router.post('/persona/:personaId/ban', banPersona);
router.post('/user/:userId/ban', banUser);
router.post('/post/:postId/takedown', takedownPost);

export default router;