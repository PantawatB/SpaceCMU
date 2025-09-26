import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { createPost, getPublicFeed, getFriendFeed, getPostById } from '../controllers/postController';

const router = Router();

// Public endpoint to fetch global feed
router.get('/feed/public', getPublicFeed);

// Protected endpoint to fetch friend feed
router.get('/feed/friends', authenticateToken, getFriendFeed);

// Protected endpoint to create a post
router.post('/', authenticateToken, createPost);

// Public endpoint to fetch a specific post by id
router.get('/:id', getPostById);

export default router;