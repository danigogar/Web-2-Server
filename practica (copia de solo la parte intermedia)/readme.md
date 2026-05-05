# 🏢 BildyApp - API de Gestión de Usuarios

API REST para la gestión de usuarios y compañías, desarrollada con Node.js, Express, MongoDB y JWT. Incluye registro, validación de email, login con tokens, onboarding de datos personales y compañía, subida de logo, invitación de compañeros, cambio de contraseña y soft delete.

## 🛠️ Tecnologías utilizadas

| Categoría | Tecnologías |
|-----------|-------------|
| **Runtime** | Node.js 22+ (ESM) |
| **Framework** | Express 5 |
| **Base de datos** | MongoDB Atlas + Mongoose |
| **Autenticación** | JWT (access + refresh tokens), bcryptjs |
| **Validación** | Zod (transform, refine, discriminatedUnion) |
| **Subida de archivos** | Multer |
| **Seguridad** | Helmet, CORS, express-rate-limit |
| **Eventos** | EventEmitter nativo |

---

## 📋 Requisitos previos

- Node.js 22 o superior
- npm 10 o superior
- Cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (gratis)

---

## 🔧 Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/bildyapp-api.git
cd bildyapp-api
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo .env en la raíz del proyecto:

```env
# Servidor
PORT=3000
NODE_ENV=development

# MongoDB Atlas
DB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/bildyapp

# JWT
JWT_SECRET=tu_secreto_jwt_muy_largo_y_seguro_minimo_32_caracteres
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Uploads
MAX_FILE_SIZE=5242880
PUBLIC_URL=http://localhost:3000
```

---

### 4. Iniciar el servidor

```bash
npm run dev
El servidor correrá en http://localhost:3000

```

---

## 📁 Estructura del proyecto

```
bildyapp-api/
├── src/
│   ├── config/
│   │   └── index.js              # Configuración centralizada
│   ├── controllers/
│   │   └── user.controller.js    # Controladores de usuario
│   ├── middleware/
│   │   ├── auth.middleware.js    # Autenticación JWT y roles
│   │   ├── error-handler.js      # Manejo centralizado de errores
│   │   ├── upload.js             # Configuración de Multer
│   │   └── validate.js           # Validación con Zod
│   ├── models/
│   │   ├── User.js               # Modelo de usuario (con virtuals e indexes)
│   │   └── Company.js            # Modelo de compañía
│   ├── routes/
│   │   └── user.routes.js        # Rutas de la API
│   ├── services/
│   │   └── notification.service.js # EventEmitter para eventos del usuario
│   ├── utils/
│   │   ├── AppError.js           # Clase de errores personalizada
│   │   ├── jwt.js                # Generación/verificación de tokens
│   │   └── password.js           # Hash y verificación de contraseñas
│   ├── validators/
│   │   └── user.validator.js     # Esquemas de validación Zod
│   ├── app.js                    # Configuración de Express
│   └── index.js                  # Punto de entrada
├── uploads/                      # Archivos subidos (logo)
├── tests/
│   └── api.http                  # Ejemplos de peticiones REST
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 📖 Endpoints de la API

### Autenticación y usuario

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/api/user/register` | Registro de usuario | ❌ No |
| PUT | `/api/user/validation` | Validación de email (código 6 dígitos) | ✅ Sí (Bearer) |
| POST | `/api/user/login` | Login con email y contraseña | ❌ No |
| POST | `/api/user/refresh` | Renovar access token con refresh token | ❌ No |
| POST | `/api/user/logout` | Cerrar sesión (invalida refresh token) | ✅ Sí (Bearer) |
| GET | `/api/user` | Obtener datos del usuario autenticado | ✅ Sí (Bearer) |
| DELETE | `/api/user?soft=true/false` | Eliminar usuario (soft/hard delete) | ✅ Sí (Bearer) |

### Onboarding

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| PUT | `/api/user/register` | Guardar datos personales (nombre, apellidos, NIF) | ✅ Sí (Bearer) |
| PATCH | `/api/user/company` | Guardar datos de la compañía (con discriminatedUnion) | ✅ Sí (Bearer) |
| PATCH | `/api/user/logo` | Subir logo de la compañía (multipart/form-data) | ✅ Sí (Bearer) |

### Gestión adicional

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| PUT | `/api/user/password` | Cambiar contraseña (Bonus) | ✅ Sí (Bearer) |
| POST | `/api/user/invite` | Invitar compañero (solo admin) | ✅ Sí (Bearer, rol admin) |

---

## 🧪 Ejemplos de peticiones

### Registro

```http
POST {{baseUrl}}/user/register
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "12345678"
}

```
#### Respuesta (201 Created):
```json
{
  "user": {
    "id": "67f...",
    "email": "usuario@ejemplo.com",
    "status": "pending",
    "role": "admin"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "a1b2c3d4e5f6..."
}

```

### Login

```http
POST {{baseUrl}}/user/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "12345678"
}

```
#### Respuesta (200 OK):

```json
{
  "user": {
    "id": "67f...",
    "email": "usuario@ejemplo.com",
    "name": "",
    "lastName": "",
    "role": "admin",
    "status": "verified"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "a1b2c3d4e5f6..."
}

```

### Onboarding - Datos personales

```http
PUT {{baseUrl}}/user/register
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "name": "Juan",
  "lastName": "Pérez García",
  "nif": "12345678A"
}

```
### Onboarding - Compañía (empresa normal)
```http
PATCH {{baseUrl}}/user/company
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "isFreelance": false,
  "name": "Mi Empresa SL",
  "cif": "B87654321",
  "address": {
    "street": "Calle Mayor",
    "number": "1",
    "postal": "28001",
    "city": "Madrid",
    "province": "Madrid"
  }
}

```
### Onboarding - Compañía (autónomo)
```http
PATCH {{baseUrl}}/user/company
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "isFreelance": true
}

```
### Subir logo
```http
PATCH {{baseUrl}}/user/logo
Authorization: Bearer {{accessToken}}
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="logo"; filename="logo.png"
Content-Type: image/png

< ./logo.png
------WebKitFormBoundary--

```
### Obtener usuario autenticado
```http
GET {{baseUrl}}/user
Authorization: Bearer {{accessToken}}

```
#### Respuesta (200 OK) - Incluye virtual fullName y Company poblada:
```json
{
  "user": {
    "id": "67f...",
    "email": "usuario@ejemplo.com",
    "name": "Juan",
    "lastName": "Pérez García",
    "fullName": "Juan Pérez García",
    "nif": "12345678A",
    "role": "admin",
    "status": "verified",
    "company": {
      "_id": "...",
      "name": "Mi Empresa SL",
      "cif": "B87654321",
      "logo": "http://localhost:3000/uploads/logo-xxx.png"
    }
  }
}

```
### Invitar compañero (solo admin)
```http
POST {{baseUrl}}/user/invite
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "email": "invitado@ejemplo.com",
  "name": "Carlos",
  "lastName": "López Ruiz"
}

```
#### Respuesta (201 Created):
```json
{
  "message": "Usuario invitado correctamente",
  "user": {
    "id": "...",
    "email": "invitado@ejemplo.com",
    "name": "Carlos",
    "lastName": "López Ruiz",
    "role": "guest",
    "temporaryPassword": "928253"
  }
}

```
### Cambiar contraseña (Bonus)
```http
PUT {{baseUrl}}/user/password
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "currentPassword": "12345678",
  "newPassword": "87654321"
}

```
### Eliminar usuario (soft delete)
```http
DELETE {{baseUrl}}/user?soft=true
Authorization: Bearer {{accessToken}}

```
#### Respuesta (200 OK):
```json
{
  "message": "Usuario eliminado (soft delete)"
}

```

---

## 📦 Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar servidor con hot-reload (`--watch`) |
| `npm start` | Iniciar servidor en producción |

---

## ⭐ Bonus implementados

| Bonus | Estado | Descripción |
|-------|--------|-------------|
| Cambiar contraseña | ✅ | Endpoint `PUT /api/user/password` con Zod `.refine()` para validar que nueva ≠ actual |
| discriminatedUnion | ✅ | Validación condicional en onboarding según `isFreelance` (autónomo vs empresa normal) |

---

## 📄 Licencia
MIT

---

## 👨‍💻 Autor
Daniel González - @danigogar

