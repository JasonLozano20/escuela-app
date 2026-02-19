import { Router } from 'express';
import { DocumentoController } from '../controllers/documento.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// Endpoint de prueba
router.post(
  '/test-upload',
  //authenticateToken,
  //requireAdmin,
  upload.single('file'),
  DocumentoController.testUpload
);

// Subir documento
router.post(
  '/upload',
  //authenticateToken,
  //requireAdmin,
  upload.single('file'),
  DocumentoController.uploadDocumento
);

export default router;