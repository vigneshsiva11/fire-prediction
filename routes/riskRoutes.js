import { Router } from 'express';
import { createRiskAssessment, getRiskHistory, getRiskAnalytics } from '../controllers/riskController.js';

const router = Router();

router.post('/', createRiskAssessment);
router.get('/history', getRiskHistory);
router.get('/analytics', getRiskAnalytics);

export default router;
