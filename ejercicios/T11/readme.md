# 📚 API de Biblioteca

API REST para la gestión de una biblioteca digital, desarrollada con Node.js, Express, Prisma y Supabase (PostgreSQL).
Incluye despliegue en Railway, Docker y CI/CD con GitHub Actions.

---

## 🚀 Características

- Autenticación de usuarios con JWT
- Gestión de libros (CRUD)
- Sistema de préstamos (máximo 3 libros simultáneos)
- Sistema de reseñas (solo usuarios que hayan leído el libro)
- Control de inventario (ejemplares disponibles)
- Base de datos en la nube con Supabase
- ORM moderno con Prisma
- Validación de datos con Zod
- Despliegue en Railway
- Containerización con Docker
- CI/CD con GitHub Actions

---

## 🛠️ Tecnologías utilizadas

| Tecnología | Propósito |
|------------|-----------|
| Node.js | Entorno de ejecución |
| Express | Framework web |
| Prisma | ORM para base de datos |
| Supabase | Base de datos PostgreSQL en la nube |
| JWT | Autenticación |
| Zod | Validación de datos |
| bcryptjs | Encriptación de contraseñas |
| Docker | Containerización |
| GitHub Actions | CI/CD |
| Railway | Plataforma de despliegue |

---

## 📋 Requisitos previos

- Node.js (v22 o superior)
- npm (v10 o superior)
- Cuenta en Supabase (gratis)
- Cuenta en Railway (gratis)
- Docker (opcional, para pruebas locales)

---

## 🔧 Instalación y configuración

### 1. Clonar el repositorio

git clone https://github.com/tu-usuario/biblioteca-api.git
cd biblioteca-api

### 2. Instalar dependencias

npm install

### 3. Configurar variables de entorno

Crea un archivo .env en la raíz del proyecto:

# Base de datos (Transaction Pooler - puerto 6543)
DATABASE_URL="postgresql://postgres.XXXXXXXXXXXX:TU_CONTRASEÑA@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Migraciones (Session Pooler - puerto 5432)
DIRECT_URL="postgresql://postgres.XXXXXXXXXXXX:TU_CONTRASEÑA@aws-0-region.pooler.supabase.com:5432/postgres"

# JWT
JWT_SECRET="tu-clave-secreta-muy-segura"

# Servidor
PORT=3000
NODE_ENV=development

### 4. Configurar Supabase

1. Crea una cuenta en Supabase
2. Crea un nuevo proyecto
3. Ve a Project Settings -> Database
4. Copia las URLs de conexión:
   - Transaction Pooler (puerto 6543) -> DATABASE_URL
   - Session Pooler (puerto 5432) -> DIRECT_URL
5. Añade ?pgbouncer=true al final de DATABASE_URL

### 5. Ejecutar migraciones

npx prisma migrate dev --name init

### 6. (Opcional) Sembrar datos de prueba

npm run db:seed

Esto creará:
- Usuarios: admin@biblioteca.com (admin123), ana@ejemplo.com (usuario123)
- Libros: Cien años de soledad, El amor en los tiempos del cólera, Rayuela, La sombra del viento

### 7. Iniciar el servidor

npm run dev

Servidor disponible en: http://localhost:3000

---

## 🚀 Despliegue en Railway

### Instalación de Railway CLI

npm install -g @railway/cli

### Iniciar sesión

railway login

### Vincular proyecto

railway link

(Selecciona el proyecto creado en Railway)

### Desplegar

railway up

### Configurar variables de entorno en Railway

railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set DATABASE_URL="postgresql://postgres.xxxx:password@xxxx.pooler.supabase.com:6543/postgres?pgbouncer=true"
railway variables set JWT_SECRET="tu-clave-secreta-de-32-caracteres"

### Ver logs

railway logs

### Abrir en navegador

railway open

### Variables de entorno necesarias en Railway

| Variable | Valor |
|----------|-------|
| NODE_ENV | production |
| PORT | 3000 |
| DATABASE_URL | URL de Supabase (con ?pgbouncer=true) |
| JWT_SECRET | Clave secreta (32+ caracteres) |

### Health check

El endpoint /health está disponible para monitorización:

curl https://tu-proyecto.railway.app/health

Respuesta esperada:

{
  "status": "ok",
  "database": "connected",
  "uptime": 140.68,
  "environment": "production"
}

---

## 🐳 Docker

### Construir imagen

docker build -t biblioteca-api .

### Ejecutar contenedor

docker run -p 3000:3000 --env-file .env biblioteca-api

### Desarrollo local con Docker Compose

docker-compose up

Esto levantará:
- API en puerto 3000
- PostgreSQL en puerto 5432

---

## ⚙️ CI/CD con GitHub Actions

El proyecto incluye pipelines automatizados en la carpeta .github/workflows/

### CI (Integración Continua) - archivo ci.yml

- Ejecuta tests en cada push a las ramas main o develop
- Ejecuta tests en cada pull request hacia main

### CD (Despliegue Continuo) - archivo deploy.yml

- Despliega automáticamente en Railway si los tests pasan
- Solo se ejecuta en pushes a la rama main

### Configurar secretos en GitHub

1. Ve a tu repositorio -> Settings -> Secrets and variables -> Actions
2. Añade el secreto RAILWAY_TOKEN
3. Obtén el token con: railway token

---

## 📖 Endpoints de la API

### Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/auth/register | Registrar nuevo usuario |
| POST | /api/auth/login | Iniciar sesión |
| GET | /api/auth/me | Obtener perfil (requiere token) |

### Libros

| Método | Ruta | Descripción | Rol requerido |
|--------|------|-------------|---------------|
| GET | /api/books | Listar libros | Público |
| GET | /api/books/:id | Obtener libro por ID | Público |
| POST | /api/books | Crear libro | LIBRARIAN, ADMIN |
| PUT | /api/books/:id | Actualizar libro | LIBRARIAN, ADMIN |
| DELETE | /api/books/:id | Eliminar libro | ADMIN |

### Préstamos

| Método | Ruta | Descripción | Rol requerido |
|--------|------|-------------|---------------|
| GET | /api/loans | Mis préstamos | Autenticado |
| GET | /api/loans/all | Todos los préstamos | LIBRARIAN, ADMIN |
| POST | /api/loans/:bookId | Solicitar préstamo | Autenticado |
| PUT | /api/loans/:id/return | Devolver libro | Autenticado |

### Reseñas

| Método | Ruta | Descripción | Rol requerido |
|--------|------|-------------|---------------|
| GET | /api/books/:id/reviews | Reseñas de un libro | Público |
| POST | /api/books/:id/reviews | Crear reseña | Autenticado |
| DELETE | /api/reviews/:id | Eliminar reseña | Autenticado |

---

## 📝 Reglas de negocio

### Préstamos
- Un usuario puede tener máximo 3 préstamos activos simultáneamente
- No se puede pedir prestado el mismo libro dos veces
- Solo se presta si hay ejemplares disponibles (available > 0)
- Duración del préstamo: 14 días

### Reseñas
- Solo una reseña por usuario por libro
- Puntuación de 1 a 5 estrellas
- Solo usuarios que hayan leído el libro (devuelto) pueden reseñar

### Inventario
- copies: total de ejemplares
- available: ejemplares disponibles
- Al prestar: available--
- Al devolver: available++

---

## 🧪 Ejemplos de peticiones

Puedes probar la API usando el archivo tests/api.http con la extensión REST Client de VS Code.

### Health check

GET http://localhost:3000/health

### Registrar usuario

POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "nuevo@ejemplo.com",
  "name": "Nuevo Usuario",
  "password": "123456"
}

### Iniciar sesión

POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "nuevo@ejemplo.com",
  "password": "123456"
}

### Listar libros

GET http://localhost:3000/api/books
Authorization: Bearer {{token}}

### Solicitar préstamo

POST http://localhost:3000/api/loans/1
Authorization: Bearer {{token}}

### Crear reseña

POST http://localhost:3000/api/books/1/reviews
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "rating": 5,
  "comment": "Excelente libro"
}

---

## 📁 Estructura del proyecto

biblioteca-api/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.js
├── src/
│   ├── app.js
│   ├── index.js
│   ├── config/
│   │   └── prisma.js
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── schemas/
│   └── utils/
├── tests/
│   └── api.http
├── .env.example
├── .dockerignore
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── package.json
├── RAILWAY.md
└── README.md

---

## 📦 Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| npm run dev | Desarrollo con hot-reload |
| npm start | Producción |
| npm run db:studio | Prisma Studio |
| npm run db:migrate | Nueva migración |
| npm run db:push | Sincronizar sin migración |
| npm run db:seed | Datos de prueba |
| docker build -t biblioteca-api . | Construir imagen Docker |
| docker run -p 3000:3000 --env-file .env biblioteca-api | Ejecutar contenedor |
| docker-compose up | Levantar entorno con BD |

---

## 🐛 Solución de problemas

### Error: Connection refused
- Asegúrate de que el servidor está corriendo con npm run dev
- Verifica que el puerto 3000 no esté ocupado

### Error: Authentication failed
- Revisa que las credenciales en .env sean correctas
- Verifica la URL de Supabase

### Error: JWT_SECRET no está definido
- Asegúrate de que la variable JWT_SECRET está en .env
- En Railway, configúrala en el dashboard

### Error: Token inválido
- El token expiró (7 días). Vuelve a hacer login.

---

## 📄 Licencia

MIT

---

## 👨‍💻 Autor

Daniel González - https://github.com/danigogar

---

**¡Disfruta de tu API de Biblioteca desplegada en Railway! 📚**