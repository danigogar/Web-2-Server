# 📚 API de Biblioteca

API REST para la gestión de una biblioteca digital, desarrollada con **Node.js**, **Express**, **Prisma** y **Supabase** (PostgreSQL).
Incluye despliegue en Railway, Docker y CI/CD con GitHub Actions.

---

## 🚀 Características

* ✅ Autenticación de usuarios con JWT
* ✅ Gestión de libros (CRUD)
* ✅ Sistema de préstamos (máximo 3 libros simultáneos)
* ✅ Sistema de reseñas (solo usuarios que hayan leído el libro)
* ✅ Control de inventario (ejemplares disponibles)
* ✅ Base de datos en la nube con Supabase
* ✅ ORM moderno con Prisma
* ✅ Validación de datos con Zod
* ✅ Despliegue en Railway
* ✅ Containerización con Docker
* ✅ CI/CD con GitHub Actions

---

## 🛠️ Tecnologías utilizadas

| Tecnología         | Propósito                           |
| ------------------ | ----------------------------------- |
| **Node.js**        | Entorno de ejecución                |
| **Express**        | Framework web                       |
| **Prisma**         | ORM para base de datos              |
| **Supabase**       | Base de datos PostgreSQL en la nube |
| **JWT**            | Autenticación                       |
| **Zod**            | Validación de datos                 |
| **bcryptjs**       | Encriptación de contraseñas         |
| **Docker**         | Containerización                    |
| **GitHub Actions** | CI/CD                               |
| **Railway**        | Plataforma de despliegue            |

---

## 📋 Requisitos previos

* Node.js (v22 o superior)
* npm (v10 o superior)
* Cuenta en [Supabase](https://supabase.com) (gratis)
* Cuenta en [Railway](https://railway.app) (gratis)
* Docker (opcional, para pruebas locales)

---

## 🔧 Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/biblioteca-api.git
cd biblioteca-api
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Base de datos (Transaction Pooler - puerto 6543)
DATABASE_URL="postgresql://postgres.XXXXXXXXXXXX:TU_CONTRASEÑA@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Migraciones (Session Pooler - puerto 5432)
DIRECT_URL="postgresql://postgres.XXXXXXXXXXXX:TU_CONTRASEÑA@aws-0-region.pooler.supabase.com:5432/postgres"

# JWT
JWT_SECRET="tu-clave-secreta-muy-segura"

# Servidor
PORT=3000
NODE_ENV=development
```

### 4. Configurar Supabase

1. Crea una cuenta en Supabase
2. Crea un nuevo proyecto
3. Ve a **Project Settings → Database**
4. Copia las URLs de conexión:
   * Transaction Pooler (puerto 6543) → `DATABASE_URL`
   * Session Pooler (puerto 5432) → `DIRECT_URL`
5. Añade `?pgbouncer=true` al final de `DATABASE_URL`

### 5. Ejecutar migraciones

```bash
npx prisma migrate dev --name init
```

### 6. (Opcional) Sembrar datos de prueba

```bash
npm run db:seed
```

Esto creará:

* Usuarios:
  * [admin@biblioteca.com](mailto:admin@biblioteca.com) (admin123)
  * [ana@ejemplo.com](mailto:ana@ejemplo.com) (usuario123)
* Libros:
  * Cien años de soledad
  * El amor en los tiempos del cólera
  * Rayuela
  * La sombra del viento

### 7. Iniciar el servidor

```bash
npm run dev
```

Servidor disponible en:
👉 http://localhost:3000

---

## 🚀 Despliegue en Railway

### Instalación de Railway CLI

```bash
npm install -g @railway/cli
```

### Iniciar sesión

```bash
railway login
```

### Vincular proyecto

```bash
railway link
```

> Selecciona el proyecto creado en Railway.

### Desplegar

```bash
railway up
```

### Configurar variables de entorno en Railway

```bash
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set DATABASE_URL="postgresql://postgres.xxxx:password@xxxx.pooler.supabase.com:6543/postgres?pgbouncer=true"
railway variables set JWT_SECRET="tu-clave-secreta-de-32-caracteres"
```

### Ver logs

```bash
railway logs
```

### Abrir en navegador

```bash
railway open
```

### Variables necesarias en Railway

| Variable     | Valor                                    |
| ------------ | ---------------------------------------- |
| NODE_ENV     | production                               |
| PORT         | 3000                                     |
| DATABASE_URL | URL de Supabase (con `?pgbouncer=true`)  |
| JWT_SECRET   | Clave secreta (32+ caracteres)           |

### Health check

```bash
curl https://tu-proyecto.railway.app/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "database": "connected",
  "uptime": 140.68,
  "environment": "production"
}
```

---

## 🐳 Docker

### Construir imagen

```bash
docker build -t biblioteca-api .
```

### Ejecutar contenedor

```bash
docker run -p 3000:3000 --env-file .env biblioteca-api
```

### Desarrollo local con Docker Compose

```bash
docker-compose up
```

Esto levantará:

* API en puerto **3000**
* PostgreSQL en puerto **5432**

---

## ⚙️ CI/CD con GitHub Actions

El proyecto incluye pipelines automatizados en `.github/workflows/`.

### CI (Integración Continua) — `ci.yml`

* Ejecuta tests en cada push a `main` o `develop`
* Ejecuta tests en cada pull request hacia `main`

### CD (Despliegue Continuo) — `deploy.yml`

* Despliega automáticamente en Railway si los tests pasan
* Solo se ejecuta en pushes a `main`

### Configurar secretos en GitHub

1. Ve a tu repositorio → **Settings → Secrets and variables → Actions**
2. Añade el secreto `RAILWAY_TOKEN`
3. Obtén el token con:

```bash
railway token
```

---

## 📖 Endpoints de la API

### 🔐 Autenticación

| Método | Ruta                  | Descripción             |
| ------ | --------------------- | ----------------------- |
| POST   | `/api/auth/register`  | Registrar nuevo usuario |
| POST   | `/api/auth/login`     | Iniciar sesión          |
| GET    | `/api/auth/me`        | Obtener perfil (token)  |

### 📚 Libros

| Método | Ruta              | Descripción       | Rol requerido    |
| ------ | ----------------- | ----------------- | ---------------- |
| GET    | `/api/books`      | Listar libros     | Público          |
| GET    | `/api/books/:id`  | Obtener libro     | Público          |
| POST   | `/api/books`      | Crear libro       | LIBRARIAN, ADMIN |
| PUT    | `/api/books/:id`  | Actualizar libro  | LIBRARIAN, ADMIN |
| DELETE | `/api/books/:id`  | Eliminar libro    | ADMIN            |

### 🔄 Préstamos

| Método | Ruta                     | Descripción          | Rol requerido    |
| ------ | ------------------------ | -------------------- | ---------------- |
| GET    | `/api/loans`             | Mis préstamos        | Autenticado      |
| GET    | `/api/loans/all`         | Todos los préstamos  | LIBRARIAN, ADMIN |
| POST   | `/api/loans/:bookId`     | Solicitar préstamo   | Autenticado      |
| PUT    | `/api/loans/:id/return`  | Devolver libro       | Autenticado      |

### ⭐ Reseñas

| Método | Ruta                      | Descripción          | Rol requerido |
| ------ | ------------------------- | -------------------- | ------------- |
| GET    | `/api/books/:id/reviews`  | Reseñas de un libro  | Público       |
| POST   | `/api/books/:id/reviews`  | Crear reseña         | Autenticado   |
| DELETE | `/api/reviews/:id`        | Eliminar reseña      | Autenticado   |

---

## 📝 Reglas de negocio

### 📦 Préstamos

* Máximo **3 préstamos activos** simultáneamente
* No se puede pedir prestado el mismo libro dos veces
* Solo si `available > 0`
* Duración: **14 días**

### ⭐ Reseñas

* Una reseña por usuario por libro
* Puntuación de **1 a 5** estrellas
* Solo si el libro fue **devuelto**

### 📚 Inventario

* `copies`: total de ejemplares
* `available`: ejemplares disponibles
* Préstamo → `available--`
* Devolución → `available++`

---

## 🧪 Ejemplos de peticiones

Puedes probar la API con el archivo `tests/api.http` usando la extensión **REST Client** de VS Code.

### Variables base

```http
@baseUrl = http://localhost:3000/api
```

### 🩺 Health check

```http
GET http://localhost:3000/health
```

### 👤 Registrar usuario

```http
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "email": "nuevo@ejemplo.com",
  "name": "Nuevo Usuario",
  "password": "123456"
}
```

### 🔐 Iniciar sesión

```http
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "nuevo@ejemplo.com",
  "password": "123456"
}
```

### 🎫 Configurar token

```http
# Opción A (recomendada)
@authToken = {{login.response.body.token}}
```

### 📚 Listar libros

```http
GET {{baseUrl}}/books
Authorization: Bearer {{authToken}}
```

### 📦 Solicitar préstamo

```http
POST {{baseUrl}}/loans/1
Authorization: Bearer {{authToken}}
```

### 📖 Ver mis préstamos

```http
GET {{baseUrl}}/loans
Authorization: Bearer {{authToken}}
```

### 🔄 Devolver libro

```http
PUT {{baseUrl}}/loans/1/return
Authorization: Bearer {{authToken}}
```

> Usa el ID del préstamo obtenido en el paso anterior.

### ⭐ Crear reseña

```http
POST {{baseUrl}}/books/1/reviews
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "rating": 5,
  "comment": "Excelente libro"
}
```

💡 **Tip:** Instala la extensión *REST Client* en VS Code para ejecutar cada petición con un solo clic.

---

## 📁 Estructura del proyecto

```text
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
```

---

## 📦 Scripts disponibles

| Comando                                                   | Descripción                 |
| --------------------------------------------------------- | --------------------------- |
| `npm run dev`                                             | Desarrollo con hot-reload   |
| `npm start`                                               | Producción                  |
| `npm run db:studio`                                       | Prisma Studio               |
| `npm run db:migrate`                                      | Nueva migración             |
| `npm run db:push`                                         | Sincronizar sin migración   |
| `npm run db:seed`                                         | Datos de prueba             |
| `docker build -t biblioteca-api .`                        | Construir imagen Docker     |
| `docker run -p 3000:3000 --env-file .env biblioteca-api`  | Ejecutar contenedor         |
| `docker-compose up`                                       | Levantar entorno con BD     |

---

## 🐛 Solución de problemas

### ❌ Connection refused

* Ejecuta `npm run dev`
* Verifica que el puerto 3000 no esté ocupado

### ❌ Authentication failed

* Revisa las credenciales en `.env`
* Verifica la URL de Supabase

### ❌ JWT_SECRET no definido

* Asegúrate de que `JWT_SECRET` está en `.env`
* En Railway, configúrala en el dashboard

### ❌ Token inválido

* El token expiró (7 días) — vuelve a hacer login

---

## 📄 Licencia

MIT

---

## 👨‍💻 Autor

Daniel González - https://github.com/danigogar

---

**¡Disfruta de tu API de Biblioteca desplegada en Railway! 📚**