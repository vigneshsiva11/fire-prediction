import { Router } from 'express';
import {
  activateDrone,
  captureDroneImage,
  getActiveDrones,
  getAvailableDrones,
  getDroneCaptures,
  stopDrone,
} from '../controllers/droneController.js';

const router = Router();

router.get('/available', getAvailableDrones);
router.get('/active', getActiveDrones);
router.post('/activate', activateDrone);
router.post('/stop', stopDrone);
router.post('/capture', captureDroneImage);
router.get('/captures', getDroneCaptures);

export default router;
