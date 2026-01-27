export type Rol = 'administrador' | 'maestro';

export interface Usuario {
  id: number;
  email: string;
  password: string;
  nombre: string;
  rol: Rol;
  fecha_registro: Date | null;
  activo: boolean | null;
}

export interface UsuarioJWT {
  id: number;
  email: string;
  nombre: string;
  rol: Rol;
  iat?: number;
  exp?: number;
}
// respuestas API sin password
export type UsuarioResponse = Omit<Usuario, 'password'>;


//Request/Response
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  nombre: string;
  rol?: Rol;
}

export interface LoginResponse {
  message: string;
  token: string;
  usuario: UsuarioResponse;
}

export interface RegisterResponse {
  message: string;
  usuario: UsuarioResponse;
}