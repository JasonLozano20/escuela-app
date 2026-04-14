import { Router } from 'express';
import { DocumentoController } from '../controllers/documento.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// Endpoint de prueba
router.post(
  '/test-upload',
  authenticateToken,
  requireAdmin,
  upload.single('file'),
  DocumentoController.testUpload
);

// Subir documento
router.post(
  '/upload',
  authenticateToken,
  requireAdmin,
  upload.single('file'),
  DocumentoController.uploadDocumento
);

//ver todos los docuemntos
router.get(
  '/all',
  authenticateToken,
  requireAdmin,
  DocumentoController.getAllDocumentos
);
// Ver estadisticas del documento
router.get(
  '/:id/estadisticas',
  authenticateToken,
  requireAdmin,
  DocumentoController.getDocumentoEstadisticas
);
//Eliminar documento (solo administtrador)
router.delete(
  '/:id',
  authenticateToken,
  requireAdmin,
  DocumentoController.deleteDocumento
);

//Rutas para los maestros 
router.get(
  '/mis-documentos',
  authenticateToken,
  DocumentoController.getMisDocumentos
);

router.get(
  '/:id/download',
  authenticateToken,
  DocumentoController.downloadDocumento
);

router.patch(
  '/:id/marcar-visto',
  authenticateToken,
  DocumentoController.marcarComoVisto
);

export default router;