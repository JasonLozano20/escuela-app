import { Request, Response } from 'express';
import prisma from '../utils/database';

export class UsuarioController {
  
  // Obtener todos los maestros
  static async getMaestros(req: Request, res: Response) {
    try {
      const maestros = await prisma.usuario.findMany({
        where: {
          rol: 'maestro',
          activo: true
        },
        select: {
          id: true,
          email: true,
          nombre: true,
          fecha_registro: true
        },
        orderBy: {
          nombre: 'asc'
        }
      });

      res.json({
        maestros,
        total: maestros.length
      });
    } catch (error) {
      console.error('Error al obtener maestros:', error);
      res.status(500).json({ error: 'Error al obtener la lista de maestros' });
    }
  }

  // Obtener todos los usuarios
  static async getAllUsuarios(req: Request, res: Response) {
    try {
      const usuarios = await prisma.usuario.findMany({
        select: {
          id: true,
          email: true,
          nombre: true,
          rol: true,
          activo: true,
          fecha_registro: true
        },
        orderBy: {
          fecha_registro: 'desc'
        }
      });

      res.json({
        usuarios,
        total: usuarios.length
      });
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ error: 'Error al obtener usuarios' });
    }
  }

}