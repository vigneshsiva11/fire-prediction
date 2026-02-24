import { Router } from 'express';
import { getEnvironmentalData, getEnvironmentalHistory } from '../controllers/environmentController.js';

const router = Router();

router.get('/history', getEnvironmentalHistory);
router.get('/', getEnvironmentalData);

export default router;
