import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UsuarioJWT } from '../types';

export const authenticateToken = (
  req: Request,
  res: Response, 
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'clave_segura'
    ) as UsuarioJWT;
    
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

export const requireAdmin = (
  req: Request,
  res: Response, 
  next: NextFunction
) => {
  if (req.usuario?.rol !== 'administrador') {
    return res.status(403).json({ error: 'Acceso restringido a administradores' });
  }
  next();
};