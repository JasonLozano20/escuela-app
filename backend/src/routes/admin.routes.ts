import { Router, Request, Response } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';


const router = Router();

// Ruta SOLO para admin
router.get('/dashboard', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  res.json({
    message: 'Bienvenido al dashboard de administrador',
    usuario: req.usuario,
    datos: {
      totalUsuarios: 0,
      totalDocumentos: 0
    }
  });
});

export default router;