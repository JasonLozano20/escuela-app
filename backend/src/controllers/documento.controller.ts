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

      // Parsear maestrosIds si viene como string
      let maestrosArray: number[] = [];
      if (maestrosIds) {
        try {
          maestrosArray = typeof maestrosIds === 'string' 
            ? JSON.parse(maestrosIds) 
            : maestrosIds;
        } catch (error) {
          return res.status(400).json({ error: 'Formato inválido de maestrosIds' });
        }
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
      if (maestrosArray.length > 0) {
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

  // Obtener todos los documentos (Administrador)
  static async getAllDocumentos(req: Request, res: Response) {
    try {
      const documentos = await prisma.documento.findMany({
        include: {
          usuarios: {
            select: {
              id: true,
              nombre: true,
              email: true
            }
          },
          documentos_asignados: {
            include: {
              usuarios: {
                select: {
                  id: true,
                  nombre: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: {
          fecha_subida: 'desc'
        }
      });

      const documentosFormateados = documentos.map(doc => ({
        ...doc,
        tamano_bytes: doc.tamano_bytes?.toString(),
        totalAsignados: doc.documentos_asignados.length,
        totalVistos: doc.documentos_asignados.filter(da => da.fecha_visto).length
      }));

      res.json({
        documentos: documentosFormateados,
        total: documentos.length
      });
    } catch (error) {
      console.error('Error al obtener documentos:', error);
      res.status(500).json({ error: 'Error al obtener documentos' });
    }
  }

  // Ver quién ha visto un documento (Administrador)
  static async getDocumentoEstadisticas(req: Request, res: Response) {
    try {
      const documentoId = parseInt(req.params.id as string)

      const documento = await prisma.documento.findUnique({
        where: { id: documentoId },
        include: {
          documentos_asignados: {
            include: {
              usuarios: {
                select: {
                  id: true,
                  nombre: true,
                  email: true
                }
              }
            }
          }
        }
      });

      if (!documento) {
        return res.status(404).json({ error: 'Documento no encontrado' });
      }

      const estadisticas = {
        documento: {
          id: documento.id,
          titulo: documento.titulo,
          fecha_subida: documento.fecha_subida
        },
        totalAsignados: documento.documentos_asignados.length,
        totalVistos: documento.documentos_asignados.filter(da => da.fecha_visto).length,
        maestros: documento.documentos_asignados.map(da => ({
          id: da.usuarios.id,
          nombre: da.usuarios.nombre,
          email: da.usuarios.email,
          fechaAsignacion: da.fecha_asignacion,
          fechaVisto: da.fecha_visto,
          visto: !!da.fecha_visto
        }))
      };

      res.json(estadisticas);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  }

  // Eliminar documento (ADMIN)
  static async deleteDocumento(req: Request, res: Response) {
    try {
      
      const documentoId = parseInt(req.params.id as string);

      const documento = await prisma.documento.findUnique({
        where: { id: documentoId }
      });

      if (!documento) {
        return res.status(404).json({ error: 'Documento no encontrado' });
      }

      // Eliminar de S3
      await S3Service.deleteFile(documento.ruta_s3);

      // Eliminar asignaciones y documento de la BD
      await prisma.documentoAsignado.deleteMany({
        where: { documento_id: documentoId }
      });

      await prisma.documento.delete({
        where: { id: documentoId }
      });

      res.json({
        message: 'Documento eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      res.status(500).json({ error: 'Error al eliminar documento' });
    }
  }
  // Obtener documentos (Maestros)
  static async getMisDocumentos(req: Request, res: Response) {
    try {
      const usuarioId = req.usuario?.id;

      const documentosAsignados = await prisma.documentoAsignado.findMany({
        where: {
          usuario_id: usuarioId
        },
        include: {
          documentos: {
            include: {
              usuarios: {
                select: {
                  nombre: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: {
          fecha_asignacion: 'desc'
        }
      });

      const documentos = documentosAsignados.map(da => ({
        id: da.documentos.id,
        titulo: da.documentos.titulo,
        descripcion: da.documentos.descripcion,
        nombre_archivo: da.documentos.nombre_archivo,
        tipo_archivo: da.documentos.tipo_archivo,
        tamano_bytes: da.documentos.tamano_bytes?.toString(),
        fecha_subida: da.documentos.fecha_subida,
        fecha_asignacion: da.fecha_asignacion,
        fecha_visto: da.fecha_visto,
        visto: !!da.fecha_visto,
        subido_por: da.documentos.usuarios?.nombre
      }));

      res.json({
        documentos,
        total: documentos.length,
        vistos: documentos.filter(d => d.visto).length,
        pendientes: documentos.filter(d => !d.visto).length
      });
    } catch (error) {
      console.error('Error al obtener mis documentos:', error);
      res.status(500).json({ error: 'Error al obtener documentos' });
    }
  }

  static async downloadDocumento(req: Request, res: Response) {
    try {
      const documentoId = parseInt(req.params.id as string); 
      const usuarioId = req.usuario?.id;

      // Verificar que el documento esté asignado al maestro
      const asignacion = await prisma.documentoAsignado.findFirst({
        where: {
          documento_id: documentoId,
          usuario_id: usuarioId
        },
        include: {
          documentos: true
        }
      });

      if (!asignacion) {
        return res.status(403).json({ error: 'No tienes acceso a este documento' });
      }

      // Generar URL firmada
      const downloadUrl = await S3Service.getSignedDownloadUrl(asignacion.documentos.ruta_s3);

      // Marcar como visto si no lo esta
      if (!asignacion.fecha_visto) {
        await prisma.documentoAsignado.update({
          where: { id: asignacion.id },
          data: {
            fecha_visto: new Date()
          }
        });
      }

      res.json({
        downloadUrl,
        nombreArchivo: asignacion.documentos.nombre_archivo
      });
    } catch (error) {
      console.error('Error al generar URL de descarga:', error);
      res.status(500).json({ error: 'Error al descargar documento' });
    }
  }

  // Marcar documento como visto 
  static async marcarComoVisto(req: Request, res: Response) {
    try {
      const documentoId = parseInt(req.params.id as string);
      const usuarioId = req.usuario?.id;

      const asignacion = await prisma.documentoAsignado.findFirst({
        where: {
          documento_id: documentoId,
          usuario_id: usuarioId
        }
      });

      if (!asignacion) {
        return res.status(404).json({ error: 'Documento no encontrado' });
      }

      if (asignacion.fecha_visto) {
        return res.json({
          message: 'Documento ya fue marcado como visto',
          fecha_visto: asignacion.fecha_visto
        });
      }

      const asignacionActualizada = await prisma.documentoAsignado.update({
        where: { id: asignacion.id },
        data: {
          fecha_visto: new Date()
        }
      });

      res.json({
        message: 'Documento marcado como visto',
        fecha_visto: asignacionActualizada.fecha_visto
      });
    } catch (error) {
      console.error('Error al marcar como visto:', error);
      res.status(500).json({ error: 'Error al marcar documento' });
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