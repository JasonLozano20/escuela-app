# Sistema de Gestión de Documentos - Escuela Preparatoria

Sistema para digitalizar el proceso de entrega y firma de documentos entre administradores y maestros.

## Características

- **Para Administradores:**
  - Crear nuevos usuarios (maestros)
  - Subir documentos
  - Asignar documentos a maestros específicos
  - Ver quién ha leído cada documento

- **Para Maestros:**
  - Ver documentos asignados
  - Descargar documentos
  - Enviar documentos al correo personal
  - Marcar documentos como leídos

## Tecnologías

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- MariaDB
- JWT para autenticación
- AWS S3 (almacenamiento de archivos)

### Frontend 
- React Native

## Instalación

### Prerrequisitos
- Node.js (v18 o superior)
- MariaDB
- npm o yarn

### Backend

1. Clona el repositorio:
```bash
git clone https://github.com/jasonlozano20/escuela-app.git
cd escuela-app/backend
```

2. Instala dependencias:
```bash
npm install
```

3. Ejecuta las migraciones de Prisma:
```bash
npx prisma migrate dev
```

4. Inicia el servidor:
```bash
npm run dev
```

El servidor estará corriendo en `http://localhost:5000`


### Modelos principales
- **Usuario**: Almacena información de administradores y maestros
- **Documento**: Información de archivos subidos
- **DocumentoAsignado**: Relación entre documentos y maestros

## Autenticación

El sistema usa JWT (JSON Web Tokens) para la autenticación. Los tokens tienen una duración de 24 horas.

### Endpoints principales

#### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión



