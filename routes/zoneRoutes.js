import { Router } from 'express';
import { getZones, getZoneById } from '../controllers/zoneController.js';

const router = Router();

router.get('/', getZones);
router.get('/:id', getZoneById);

export default router;
