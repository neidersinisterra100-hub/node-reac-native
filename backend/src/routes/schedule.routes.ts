import { Router } from 'express';
import {
  getPendingTrips,
  applyScheduler,
} from '../controllers/schedule.controller.js';
import { 
  getAdminSchedules, 
  setAdminSchedule 
} from '../controllers/admin-schedule.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';

const router = Router();

/**
 * ⚠️ IMPORTANTE
 * Estas rutas SOLO deben ser usadas por:
 * - Usuario técnico (role = system)
 * - n8n
 */

// Obtener qué viajes activar / desactivar
router.get('/pending-trips', requireAuth, getPendingTrips);

// Aplicar cambios
router.post('/apply', requireAuth, applyScheduler);

/* =========================================================
   GESTIÓN DE TURNOS (ADMINISTRADORES)
   ========================================================= */

// Obtener calendario (requiere auth, cualquier rol con acceso a la empresa)
router.get('/', requireAuth, getAdminSchedules);

// Asignar turno (requiere auth)
router.post('/', requireAuth, setAdminSchedule);

export default router;
