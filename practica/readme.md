# 🏢 BildyApp - API de Gestión de Albaranes

API REST completa para la gestión de albaranes (partes de horas o materiales) entre clientes y proveedores. Desarrollada con Node.js, Express, MongoDB, JWT y Docker.

---

## 🚀 Características

- Autenticación de usuarios con JWT (access + refresh tokens)
- Envío de emails de verificación con Nodemailer (Ethereal)
- Onboarding de usuarios y gestión de compañías
- CRUD completo de clientes, proyectos y albaranes
- Sistema de préstamos (albaranes de materiales y horas)
- Generación de PDFs de albaranes con pdfkit
- Firma de albaranes con subida de imágenes a Cloudinary
- Dashboard estadístico con aggregation pipeline (Bonus)
- Documentación interactiva con Swagger
- Tests automatizados con Jest y mongodb-memory-server
- Logging de errores 5XX a Slack
- WebSockets con Socket.IO para notificaciones en tiempo real
- Containerización con Docker y Docker Compose
- CI/CD con GitHub Actions
- Despliegue en Railway

---

## 🛠️ Tecnologías utilizadas

| Tecnología | Propósito |
|------------|-----------|
| Node.js | Entorno de ejecución |
| Express | Framework web |
| MongoDB Atlas | Base de datos en la nube |
| Mongoose | ODM para MongoDB |
| JWT | Autenticación (access + refresh) |
| bcryptjs | Encriptación de contraseñas |
| Zod | Validación de datos |
| Multer | Subida de archivos |
| Cloudinary | Almacenamiento de firmas y PDFs |
| pdfkit | Generación de PDFs |
| Socket.IO | WebSockets para notificaciones |
| Swagger | Documentación de API |
| Jest | Tests automatizados |
| Docker | Containerización |
| GitHub Actions | CI/CD |
| Railway | Despliegue |

---

## 📋 Requisitos previos

- Node.js (v22 o superior)
- npm (v10 o superior)
- Cuenta en MongoDB Atlas (gratis)
- Cuenta en Cloudinary (gratis)
- Cuenta en Slack (para logging, opcional)
- Cuenta en Railway (para despliegue, opcional)

---

## 🔧 Instalación y configuración

### 1. Clonar el repositorio

git clone https://github.com/tu-usuario/bildyapp-api.git
cd bildyapp-api

### 2. Instalar dependencias

npm install

### 3. Configurar variables de entorno

Crea un archivo .env en la raíz del proyecto:

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

### 4. Iniciar el servidor

npm run dev

Servidor disponible en: http://localhost:3000

---

## 📁 Estructura del proyecto

bildyapp-api/
├── src/
│   ├── config/
│   │   ├── index.js
│   │   └── swagger.js
│   ├── controllers/
│   │   ├── user.controller.js
│   │   ├── client.controller.js
│   │   ├── project.controller.js
│   │   └── deliverynote.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error-handler.js
│   │   ├── validate.js
│   │   └── upload.js
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
│   │   ├── AppError.js
│   │   ├── jwt.js
│   │   └── password.js
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
├── .github/workflows/
│   └── test.yml
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .env.example
├── .gitignore
├── jest.config.js
├── package.json
└── README.md

---

## 📖 Endpoints de la API

### Autenticación y Usuario

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /api/user/register | Registrar usuario |
| PUT | /api/user/validation | Validar email con código |
| POST | /api/user/login | Iniciar sesión |
| GET | /api/user | Obtener perfil |
| PUT | /api/user | Actualizar datos personales |
| DELETE | /api/user | Eliminar usuario (soft/hard) |
| PATCH | /api/user/company | Crear/actualizar compañía |
| PATCH | /api/user/logo | Subir logo |
| POST | /api/user/refresh | Renovar access token |
| POST | /api/user/logout | Cerrar sesión |
| PUT | /api/user/password | Cambiar contraseña (Bonus) |
| POST | /api/user/invite | Invitar compañero |

### Clientes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /api/client | Crear cliente |
| GET | /api/client | Listar clientes |
| GET | /api/client/archived | Listar clientes archivados |
| GET | /api/client/:id | Obtener cliente |
| PUT | /api/client/:id | Actualizar cliente |
| DELETE | /api/client/:id | Eliminar cliente (soft/hard) |
| PATCH | /api/client/:id/restore | Restaurar cliente |

### Proyectos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /api/project | Crear proyecto |
| GET | /api/project | Listar proyectos |
| GET | /api/project/archived | Listar proyectos archivados |
| GET | /api/project/:id | Obtener proyecto |
| PUT | /api/project/:id | Actualizar proyecto |
| DELETE | /api/project/:id | Eliminar proyecto (soft/hard) |
| PATCH | /api/project/:id/restore | Restaurar proyecto |

### Albaranes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /api/deliverynote | Crear albarán |
| GET | /api/deliverynote | Listar albaranes |
| GET | /api/deliverynote/:id | Obtener albarán |
| DELETE | /api/deliverynote/:id | Eliminar albarán |
| PATCH | /api/deliverynote/:id/sign | Firmar albarán |
| GET | /api/deliverynote/pdf/:id | Descargar PDF |

### Dashboard (Bonus)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/dashboard | Estadísticas (albaranes por mes, horas por proyecto, materiales por cliente) |

### Documentación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api-docs | Swagger UI interactiva |
| GET | /health | Health check (status, db, uptime, timestamp) |

---

## 🐳 Docker

### Construir imagen

docker build -t bildyapp-api .

### Ejecutar con Docker Compose

docker-compose up --build

El comando levanta:
- API en puerto 3000
- MongoDB en puerto 27017

### Variables para Docker Compose

Define en docker-compose.yml:
- DB_URI=mongodb://mongo:27017/bildyapp
- JWT_SECRET=tu-clave-secreta

---

## ⚙️ CI/CD con GitHub Actions

El pipeline ejecuta automáticamente los tests en cada push a las ramas main o develop.

Archivo: .github/workflows/test.yml

---

## 🧪 Tests

### Ejecutar tests

npm test

### Ver cobertura

npm test -- --coverage

Cobertura actual: 56% (objetivo 70%)

### Base de datos de test

Usa mongodb-memory-server (BD en memoria)

---

## 📦 Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| npm run dev | Desarrollo con hot-reload |
| npm start | Producción |
| npm test | Ejecutar tests |
| npm test -- --coverage | Tests con cobertura |
| docker-compose up --build | Levantar contenedores |

---

## 📄 Licencia

MIT

---

## 👨‍💻 Autor

Daniel González - @danigogar

---

**¡Disfruta de BildyApp! 🏢**