import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/database';
import { Usuario, UsuarioResponse, RegisterRequest, LoginRequest, Rol } from '../types';

export class AuthService {
  
  // Registrar nuevo usuario
  static async register(data: RegisterRequest): Promise<UsuarioResponse> {
    // Verificar si usuario existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: data.email }
    });

    if (usuarioExistente) {
      throw new Error('El email ya está registrado');
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Crear usuario
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        email: data.email,
        password: hashedPassword,
        nombre: data.nombre,
        rol: data.rol || 'maestro'
      }
    }) as Usuario;

    // Retornar sin password
    const { password, ...usuarioSinPassword } = nuevoUsuario;
    return usuarioSinPassword;
  }

  // Login de usuario
  static async login(credentials: LoginRequest): Promise<{ 
    usuario: UsuarioResponse; 
    token: string; 
  }> {
    // Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { email: credentials.email }
    }) as Usuario | null;

    if (!usuario) {
      throw new Error('Credenciales incorrectas');
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(
      credentials.password, 
      usuario.password
    );

    if (!passwordValida) {
      throw new Error('Credenciales incorrectas');
    }

    // Verificar si está activo
    if (!usuario.activo) {
      throw new Error('Usuario inactivo');
    }

    // Generar JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol
      },
      process.env.JWT_SECRET || 'clave_segura',
      { expiresIn: '24h' }
    );

    // Retornar sin password
    const { password, ...usuarioSinPassword } = usuario;
    
    return {
      usuario: usuarioSinPassword,
      token
    };
  }
}