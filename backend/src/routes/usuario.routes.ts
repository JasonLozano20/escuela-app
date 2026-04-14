import { Router } from 'express';
import { UsuarioController } from '../controllers/usuario.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Estas rutas requieren autorizacion del administrador
router.get('/maestros', authenticateToken, requireAdmin, UsuarioController.getMaestros);
router.get('/all', authenticateToken, requireAdmin, UsuarioController.getAllUsuarios);

export default router;