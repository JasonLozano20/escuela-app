import { Request, Response } from 'express';
import { S3Service } from '../services/s3.service';
import prisma from '../utils/database';

export class DocumentoController {
  
  // Subir documento
  static async uploadDocumento(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se proporcionó ningun archivo' });
      }

      const { titulo, descripcion, maestrosIds } = req.body;
      const usuarioId = req.usuario?.id;

      if (!titulo) {
        return res.status(400).json({ error: 'El titulo es requerido' });
      }

      // Subir archivo a S3
      const rutaS3 = await S3Service.uploadFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      // Guardar en base de datos
      const documento = await prisma.documento.create({
        data: {
          titulo,
          descripcion: descripcion || null,
          nombre_archivo: req.file.originalname,
          ruta_s3: rutaS3,
          tipo_archivo: req.file.mimetype,
          tamano_bytes: BigInt(req.file.size),
          usuario_id: usuarioId
        }
      });

      // Si hay maestros seleccionados, asignar el documento
      if (maestrosIds && Array.isArray(maestrosIds) && maestrosIds.length > 0) {
        const asignaciones = maestrosIds.map((maestroId: number) => ({
          documento_id: documento.id,
          usuario_id: maestroId
        }));

        await prisma.documentoAsignado.createMany({
          data: asignaciones
        });
      }

      res.status(201).json({
        message: 'Documento subido exitosamente',
        documento: {
          ...documento,
          tamano_bytes: documento.tamano_bytes?.toString()
        }
      });
    } catch (error: any) {
      console.error('Error al subir documento:', error);
      res.status(500).json({ error: 'Error al subir el documento' });
    }
  }

  // Test endpoint 
  static async testUpload(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const fileKey = await S3Service.uploadFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        'test'
      );
      
      const downloadUrl = await S3Service.getSignedDownloadUrl(fileKey);

      res.json({
        message: 'S3 funciona correctamente',
        fileKey,
        downloadUrl,
        fileInfo: {
          name: req.file.originalname,
          size: req.file.size,
          type: req.file.mimetype
        }
      });
    } catch (error: any) {
      console.error('Error en test upload:', error);
      res.status(500).json({ 
        error: 'Upload failed',
        details: error.message 
      });
    }
  }
}