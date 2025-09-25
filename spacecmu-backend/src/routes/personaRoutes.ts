import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getMyPersona, upsertPersona } from '../controllers/personaController';

const router = Router();

router.get('/me', authenticateToken, getMyPersona);
router.post('/', authenticateToken, upsertPersona);

export default router;