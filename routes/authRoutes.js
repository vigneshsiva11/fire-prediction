import { Router } from 'express';
import { login, logout, me } from '../controllers/authController.js';
import { protectRoute } from '../middleware/protectRoute.js';

const router = Router();

router.post('/login', login);
router.post('/logout', protectRoute, logout);
router.get('/me', protectRoute, me);

export default router;
