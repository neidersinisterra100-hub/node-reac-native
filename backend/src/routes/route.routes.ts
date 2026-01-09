import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth.js';
import {
  createRoute,
  getRoutesByRole,
  getCompanyRoutes,
  toggleRouteActive,
  deleteRoute,
} from '../controllers/route.controller.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(requireAuth);

// Crear nueva ruta (Solo Owner)
router.post('/', createRoute);

// Listar rutas (Vista General)
router.get('/', getRoutesByRole);

// Listar rutas de una empresa ESPECÍFICA (Ahora sí filtra de verdad)
router.get('/company/:companyId', getCompanyRoutes);

// Activar/Desactivar ruta
router.patch('/:routeId', toggleRouteActive);

// Eliminar ruta
router.delete('/:routeId', deleteRoute);

export default router;
