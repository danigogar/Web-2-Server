# 📚 API de Biblioteca

API REST para la gestión de una biblioteca digital, desarrollada con **Node.js**, **Express**, **Prisma** y **Supabase** (PostgreSQL).

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

---

## 🛠️ Tecnologías utilizadas

| Tecnología   | Propósito                           |
| ------------ | ----------------------------------- |
| **Node.js**  | Entorno de ejecución                |
| **Express**  | Framework web                       |
| **Prisma**   | ORM para base de datos              |
| **Supabase** | Base de datos PostgreSQL en la nube |
| **JWT**      | Autenticación                       |
| **Zod**      | Validación de datos                 |
| **bcryptjs** | Encriptación de contraseñas         |

---

## 📋 Requisitos previos

* Node.js (v22 o superior)
* npm (v10 o superior)
* Cuenta en https://supabase.com (gratis)

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

---

### 4. Configurar Supabase

1. Crea una cuenta en Supabase
2. Crea un nuevo proyecto
3. Ve a **Project Settings → Database**
4. Copia las URLs de conexión:

   * Transaction Pooler (puerto 6543) → `DATABASE_URL`
   * Session Pooler (puerto 5432) → `DIRECT_URL`
5. Añade `?pgbouncer=true` al final de `DATABASE_URL`

---

### 5. Ejecutar migraciones

```bash
npx prisma migrate dev --name init
```

---

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

---

### 7. Iniciar el servidor

```bash
npm run dev
```

Servidor disponible en:
👉 http://localhost:3000

---

## 📖 Endpoints de la API

### 🔐 Autenticación

| Método | Ruta                 | Descripción             |
| ------ | -------------------- | ----------------------- |
| POST   | `/api/auth/register` | Registrar nuevo usuario |
| POST   | `/api/auth/login`    | Iniciar sesión          |
| GET    | `/api/auth/me`       | Obtener perfil          |

---

### 📚 Libros

| Método | Ruta             | Descripción      | Rol              |
| ------ | ---------------- | ---------------- | ---------------- |
| GET    | `/api/books`     | Listar libros    | Público          |
| GET    | `/api/books/:id` | Obtener libro    | Público          |
| POST   | `/api/books`     | Crear libro      | LIBRARIAN, ADMIN |
| PUT    | `/api/books/:id` | Actualizar libro | LIBRARIAN, ADMIN |
| DELETE | `/api/books/:id` | Eliminar libro   | ADMIN            |

---

### 🔄 Préstamos

| Método | Ruta                    | Descripción         | Rol              |
| ------ | ----------------------- | ------------------- | ---------------- |
| GET    | `/api/loans`            | Mis préstamos       | Autenticado      |
| GET    | `/api/loans/all`        | Todos los préstamos | LIBRARIAN, ADMIN |
| POST   | `/api/loans/:bookId`    | Solicitar préstamo  | Autenticado      |
| PUT    | `/api/loans/:id/return` | Devolver libro      | Autenticado      |

---

### ⭐ Reseñas

| Método | Ruta                     | Descripción         | Rol         |
| ------ | ------------------------ | ------------------- | ----------- |
| GET    | `/api/books/:id/reviews` | Reseñas de un libro | Público     |
| POST   | `/api/books/:id/reviews` | Crear reseña        | Autenticado |
| DELETE | `/api/reviews/:id`       | Eliminar reseña     | Autenticado |

---

## 📝 Reglas de negocio

### 📦 Préstamos

* Máximo **3 préstamos activos**
* No repetir el mismo libro
* Solo si `available > 0`
* Duración: **14 días**

### ⭐ Reseñas

* Una reseña por usuario por libro
* Puntuación de **1 a 5**
* Solo si el libro fue **devuelto**

### 📚 Inventario

* `copies`: total
* `available`: disponibles
* Préstamo → `available--`
* Devolución → `available++`

---

## 🧪 Ejemplos de peticiones

Puedes probar fácilmente la API utilizando el archivo:

📄 `tests/api.http`

Este archivo está pensado para usarse con extensiones como **REST Client (VS Code)** o herramientas compatibles con archivos `.http`.

---

### ▶️ Cómo usarlo

1. Abre el archivo `tests/api.http`
2. Ejecuta las peticiones en orden (de arriba hacia abajo)
3. Asegúrate de que el servidor esté corriendo en:

   ```
   http://localhost:3000
   ```

---

### 🔧 Variables base

```http
@baseUrl = http://localhost:3000/api
```

---

### 🩺 Health check

```http
GET http://localhost:3000/health
```

---

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

---

### 🔐 Iniciar sesión

```http
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "nuevo@ejemplo.com",
  "password": "123456"
}
```

---

### 🎫 Configurar token

El archivo ya incluye varias opciones para capturar el token automáticamente:

```http
# Opción A (recomendada)
@authToken = {{login.response.body.token}}

# Opción B
# @authToken = {{login.response.body.$.token}}

# Opción C
# @authToken = {{login.response.$.token}}
```

---

### 📚 Listar libros

```http
GET {{baseUrl}}/books
Authorization: Bearer {{authToken}}
```

---

### 📦 Solicitar préstamo

```http
POST {{baseUrl}}/loans/1
Authorization: Bearer {{authToken}}
```

---

### 📖 Ver mis préstamos

```http
GET {{baseUrl}}/loans
Authorization: Bearer {{authToken}}
```

---

### 🔄 Devolver libro

```http
PUT {{baseUrl}}/loans/1/return
Authorization: Bearer {{authToken}}
```

> Usa el ID del préstamo obtenido en el paso anterior.

---

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

---

💡 **Tip:** Si usas VS Code, instala la extensión *REST Client* para ejecutar cada petición con un solo clic.


---

## 📁 Estructura del proyecto

```text
biblioteca-api/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.js
├── src/
│   ├── app.js
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
├── package.json
└── README.md
```

---

## 📦 Scripts disponibles

| Comando            | Descripción               |
| ------------------ | ------------------------- |
| npm run dev        | Desarrollo con hot-reload |
| npm start          | Producción                |
| npm run db:studio  | Prisma Studio             |
| npm run db:migrate | Nueva migración           |
| npm run db:push    | Sin migración             |
| npm run db:seed    | Datos de prueba           |

---

## 🐛 Solución de problemas

### ❌ Connection refused

* Ejecuta `npm run dev`
* Verifica el puerto 3000

### ❌ Authentication failed

* Revisa `.env`
* Verifica credenciales de Supabase

### ❌ P2002

* Registro duplicado (email, ISBN, etc.)

### ❌ Token inválido

* Token expirado (7 días)

---

## 📄 Licencia

MIT

---

## 👨‍💻 Autor

Daniel González - https://github.com/danigogar

---

**¡Disfruta de tu API de Biblioteca! 📚**
