# 🏢 BildyApp - API de Gestión de Albaranes

API REST completa para la gestión de albaranes (partes de horas o materiales) entre clientes y proveedores. Desarrollada con **Node.js**, **Express**, **MongoDB**, **JWT** y **Docker**.

---

## 🚀 Características

* ✅ Autenticación de usuarios con JWT (access + refresh tokens)
* ✅ Envío de emails de verificación con Nodemailer (Ethereal)
* ✅ Onboarding de usuarios y gestión de compañías
* ✅ CRUD completo de clientes, proyectos y albaranes
* ✅ Generación de PDFs de albaranes con pdfkit
* ✅ Firma de albaranes con subida de imágenes a Cloudinary
* ✅ Dashboard estadístico con aggregation pipeline (Bonus)
* ✅ Documentación interactiva con Swagger
* ✅ Tests automatizados con Jest y mongodb-memory-server
* ✅ Logging de errores 5XX a Slack
* ✅ WebSockets con Socket.IO para notificaciones en tiempo real
* ✅ Containerización con Docker y Docker Compose
* ✅ CI/CD con GitHub Actions
* ✅ Despliegue en Railway

---

## 🛠️ Tecnologías utilizadas

| Categoría           | Tecnologías                                   |
| ------------------- | --------------------------------------------- |
| **Runtime**         | Node.js 22+                                   |
| **Framework**       | Express                                       |
| **Base de datos**   | MongoDB Atlas + Mongoose                      |
| **Autenticación**   | JWT (access + refresh tokens), bcryptjs       |
| **Validación**      | Zod                                           |
| **Archivos**        | Multer, Cloudinary                            |
| **PDF**             | pdfkit                                        |
| **Tiempo real**     | Socket.IO                                     |
| **Documentación**   | Swagger                                       |
| **Tests**           | Jest, mongodb-memory-server                   |
| **Infra**           | Docker, GitHub Actions, Railway               |

---

## 📋 Requisitos previos

* Node.js v22 o superior
* npm v10 o superior
* Cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (gratis)
* Cuenta en [Cloudinary](https://cloudinary.com) (gratis)
* Cuenta en Slack (para logging, opcional)
* Cuenta en [Railway](https://railway.app) (para despliegue, opcional)

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

Crea un archivo `.env` en la raíz del proyecto:

```env
# Servidor
PORT=3000
NODE_ENV=development

# MongoDB
DB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/bildyapp

# JWT
JWT_SECRET=tu_clave_secreta_de_32_caracteres
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Email (Ethereal para pruebas)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=tu_usuario@ethereal.email
SMTP_PASS=tu_contraseña_ethereal
SMTP_FROM=tu_usuario@ethereal.email
SMTP_SECURE=false

# Slack (opcional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx/yyy/zzz

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### 4. Iniciar el servidor

```bash
npm run dev
```

Servidor disponible en:
👉 http://localhost:3000

---

## 📁 Estructura del proyecto

```text
bildyapp-api/
├── src/
│   ├── config/
│   │   ├── index.js                      # Configuración centralizada
│   │   └── swagger.js                    # Configuración de Swagger
│   ├── controllers/
│   │   ├── user.controller.js
│   │   ├── client.controller.js
│   │   ├── project.controller.js
│   │   └── deliverynote.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js            # Autenticación JWT y roles
│   │   ├── error-handler.js             # Manejo centralizado de errores
│   │   ├── validate.js                  # Validación con Zod
│   │   └── upload.js                    # Configuración de Multer
│   ├── models/
│   │   ├── User.js
│   │   ├── Company.js
│   │   ├── Client.js
│   │   ├── Project.js
│   │   └── DeliveryNote.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── user.routes.js
│   │   ├── client.routes.js
│   │   ├── project.routes.js
│   │   ├── deliverynote.routes.js
│   │   └── dashboard.routes.js
│   ├── services/
│   │   ├── notification.service.js
│   │   ├── mail.service.js
│   │   ├── logger.service.js
│   │   ├── pdf.service.js
│   │   └── storage.service.js
│   ├── socket/
│   │   └── index.js
│   ├── utils/
│   │   ├── AppError.js                  # Clase de errores personalizada
│   │   ├── jwt.js                       # Generación/verificación de tokens
│   │   └── password.js                  # Hash y verificación de contraseñas
│   ├── validators/
│   │   ├── user.validator.js
│   │   ├── client.validator.js
│   │   ├── project.validator.js
│   │   └── deliverynote.validator.js
│   ├── app.js
│   └── index.js
├── tests/
│   ├── setup.js
│   ├── auth.test.js
│   ├── client.test.js
│   ├── project.test.js
│   ├── deliverynote.test.js
│   └── dashboard.test.js
├── .github/
│   └── workflows/
│       └── test.yml
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .env.example
├── .gitignore
├── jest.config.js
├── package.json
└── README.md
```

---

## 📖 Endpoints de la API

### 👤 Autenticación y Usuario

| Método | Endpoint                | Descripción                          | Autenticación |
| ------ | ----------------------- | ------------------------------------ | ------------- |
| POST   | `/api/user/register`    | Registrar usuario                    | ❌ No         |
| PUT    | `/api/user/validation`  | Validar email con código             | ✅ Sí         |
| POST   | `/api/user/login`       | Iniciar sesión                       | ❌ No         |
| GET    | `/api/user`             | Obtener perfil                       | ✅ Sí         |
| PUT    | `/api/user`             | Actualizar datos personales          | ✅ Sí         |
| DELETE | `/api/user`             | Eliminar usuario (soft/hard)         | ✅ Sí         |
| PATCH  | `/api/user/company`     | Crear/actualizar compañía            | ✅ Sí         |
| PATCH  | `/api/user/logo`        | Subir logo                           | ✅ Sí         |
| POST   | `/api/user/refresh`     | Renovar access token                 | ❌ No         |
| POST   | `/api/user/logout`      | Cerrar sesión                        | ✅ Sí         |
| PUT    | `/api/user/password`    | Cambiar contraseña (Bonus)           | ✅ Sí         |
| POST   | `/api/user/invite`      | Invitar compañero (solo admin)       | ✅ Sí (admin) |

### 🏢 Clientes

| Método | Endpoint                      | Descripción                  | Autenticación |
| ------ | ----------------------------- | ---------------------------- | ------------- |
| POST   | `/api/client`                 | Crear cliente                | ✅ Sí         |
| GET    | `/api/client`                 | Listar clientes              | ✅ Sí         |
| GET    | `/api/client/archived`        | Listar clientes archivados   | ✅ Sí         |
| GET    | `/api/client/:id`             | Obtener cliente              | ✅ Sí         |
| PUT    | `/api/client/:id`             | Actualizar cliente           | ✅ Sí         |
| DELETE | `/api/client/:id`             | Eliminar cliente (soft/hard) | ✅ Sí         |
| PATCH  | `/api/client/:id/restore`     | Restaurar cliente            | ✅ Sí         |

### 📂 Proyectos

| Método | Endpoint                       | Descripción                   | Autenticación |
| ------ | ------------------------------ | ----------------------------- | ------------- |
| POST   | `/api/project`                 | Crear proyecto                | ✅ Sí         |
| GET    | `/api/project`                 | Listar proyectos              | ✅ Sí         |
| GET    | `/api/project/archived`        | Listar proyectos archivados   | ✅ Sí         |
| GET    | `/api/project/:id`             | Obtener proyecto              | ✅ Sí         |
| PUT    | `/api/project/:id`             | Actualizar proyecto           | ✅ Sí         |
| DELETE | `/api/project/:id`             | Eliminar proyecto (soft/hard) | ✅ Sí         |
| PATCH  | `/api/project/:id/restore`     | Restaurar proyecto            | ✅ Sí         |

### 📋 Albaranes

| Método | Endpoint                     | Descripción       | Autenticación |
| ------ | ---------------------------- | ----------------- | ------------- |
| POST   | `/api/deliverynote`          | Crear albarán     | ✅ Sí         |
| GET    | `/api/deliverynote`          | Listar albaranes  | ✅ Sí         |
| GET    | `/api/deliverynote/:id`      | Obtener albarán   | ✅ Sí         |
| DELETE | `/api/deliverynote/:id`      | Eliminar albarán  | ✅ Sí         |
| PATCH  | `/api/deliverynote/:id/sign` | Firmar albarán    | ✅ Sí         |
| GET    | `/api/deliverynote/pdf/:id`  | Descargar PDF     | ✅ Sí         |

### 📊 Dashboard (Bonus)

| Método | Endpoint         | Descripción                                                                       | Autenticación |
| ------ | ---------------- | --------------------------------------------------------------------------------- | ------------- |
| GET    | `/api/dashboard` | Estadísticas (albaranes por mes, horas por proyecto, materiales por cliente)      | ✅ Sí         |

### 🔧 Utilidades

| Método | Endpoint    | Descripción                                  |
| ------ | ----------- | -------------------------------------------- |
| GET    | `/api-docs` | Swagger UI interactiva                       |
| GET    | `/health`   | Health check (status, db, uptime, timestamp) |

---

## 🧪 Ejemplos de peticiones

### Registrar usuario

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

### Iniciar sesión

```http
POST {{baseUrl}}/user/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "12345678"
}
```

### Crear cliente

```http
POST {{baseUrl}}/client
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "name": "Empresa Ejemplo SL",
  "cif": "B12345678",
  "address": {
    "street": "Calle Mayor",
    "number": "1",
    "postal": "28001",
    "city": "Madrid",
    "province": "Madrid"
  }
}
```

### Crear albarán

```http
POST {{baseUrl}}/deliverynote
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "clientId": "...",
  "projectId": "...",
  "type": "hours",
  "entries": [
    { "description": "Desarrollo frontend", "hours": 8 }
  ]
}
```

### Firmar albarán

```http
PATCH {{baseUrl}}/deliverynote/:id/sign
Authorization: Bearer {{accessToken}}
Content-Type: multipart/form-data

signature: <imagen de firma>
```

### Descargar PDF

```http
GET {{baseUrl}}/deliverynote/pdf/:id
Authorization: Bearer {{accessToken}}
```

💡 **Tip:** Usa los archivos de `tests/` con la extensión *REST Client* de VS Code para ejecutar todas las peticiones con un solo clic.

---

## 🐳 Docker

### Construir imagen

```bash
docker build -t bildyapp-api .
```

### Ejecutar con Docker Compose

```bash
docker-compose up --build
```

Esto levantará:

* API en puerto **3000**
* MongoDB en puerto **27017**

### Variables para Docker Compose

Define en `docker-compose.yml`:

```yaml
DB_URI: mongodb://mongo:27017/bildyapp
JWT_SECRET: tu-clave-secreta
```

---

## ⚙️ CI/CD con GitHub Actions

El pipeline ejecuta automáticamente los tests en cada push a `main` o `develop`.

Archivo: `.github/workflows/test.yml`

---

## 🧪 Tests

### Ejecutar tests

```bash
npm test
```

### Ver cobertura

```bash
npm test -- --coverage
```

Usa `mongodb-memory-server` — no necesita MongoDB instalado localmente.

---

## 📦 Scripts disponibles

| Comando                     | Descripción               |
| --------------------------- | ------------------------- |
| `npm run dev`               | Desarrollo con hot-reload |
| `npm start`                 | Producción                |
| `npm test`                  | Ejecutar tests            |
| `npm test -- --coverage`    | Tests con cobertura       |
| `docker-compose up --build` | Levantar contenedores     |

---

## ⭐ Bonus implementados

| Bonus                 | Estado | Descripción                                                                 |
| --------------------- | ------ | --------------------------------------------------------------------------- |
| Dashboard estadístico | ✅     | Aggregation pipeline con albaranes por mes, horas por proyecto y materiales |
| Cambiar contraseña    | ✅     | Endpoint `PUT /api/user/password` con validación Zod                        |

---

## 📄 Licencia

MIT

---

## 👨‍💻 Autor

Daniel González — @danigogar

---

**¡Disfruta de BildyApp! 🏢**
