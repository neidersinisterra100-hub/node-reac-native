import { Router } from 'express';
import { MarineController } from '../controllers/marine.controller.js';

const router = Router();

router.get('/weather', MarineController.getWeather);
router.get('/tides', MarineController.getTides);

export default router;
