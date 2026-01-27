import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { RegisterRequest, LoginRequest } from '../types';

export class AuthController {
  
  // Registrar usuario
  static async register(req: Request, res: Response) {
    try {
      const data: RegisterRequest = req.body;

      if (!data.email || !data.password || !data.nombre) {
        return res.status(400).json({ 
          error: 'Faltan campos requeridos',
          required: ['email', 'password', 'nombre']
        });
      }

      const usuario = await AuthService.register(data);
      
      res.status(201).json({
        message: 'Usuario creado exitosamente',
        usuario
      });

    } catch (error: any) {
      if (error.message === 'El email ya está registrado') {
        return res.status(400).json({ error: error.message });
      }
      
      console.error('Error en registro:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Login de usuario
  static async login(req: Request, res: Response) {
    try {
      const credentials: LoginRequest = req.body;

      if (!credentials.email || !credentials.password) {
        return res.status(400).json({ 
          error: 'Email y contraseña requeridos'
        });
      }

      const { usuario, token } = await AuthService.login(credentials);
      
      res.json({
        message: 'Login exitoso',
        token,
        usuario
      });

    } catch (error: any) {
      const message = error.message;
      
      if (message === 'Credenciales incorrectas' || 
          message === 'Usuario inactivo') {
        return res.status(401).json({ error: message });
      }
      
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}