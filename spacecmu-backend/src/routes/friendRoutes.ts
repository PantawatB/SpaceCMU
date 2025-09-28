import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { sendFriendRequest, listFriendRequests, respondToFriendRequest, listFriends, removeFriend } from '../controllers/friendController';

const router = Router();

// All routes in this file require authentication
router.use(authenticateToken);

router.post('/request', sendFriendRequest);
router.get('/requests', listFriendRequests);
router.post('/request/:requestId/respond', respondToFriendRequest);
router.get('/list', listFriends);
router.delete('/:friendId', removeFriend);

export default router;