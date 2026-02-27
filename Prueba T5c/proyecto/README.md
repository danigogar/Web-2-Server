# Proyecto Node.js REST API

API REST construida con **Express**, **MongoDB** y **Mongoose**, siguiendo el patrón **MVC**.

## Stack

- **Node.js 22+** con ES Modules nativos
- **Express 4** — servidor y enrutamiento
- **MongoDB** + **Mongoose 8** — base de datos y modelos
- **Zod** — validación de schemas
- **Multer** — subida de archivos
- **CORS** — gestión de orígenes cruzados

> ℹ️ No necesita `dotenv`. Usa `--env-file` nativo de Node.js 20.6+

## Instalación

```bash
npm install
cp .env.example .env
# Edita .env con tu DB_URI de MongoDB Atlas
npm run dev
```

## Variables de entorno

| Variable     | Descripción                          |
|--------------|--------------------------------------|
| `PORT`       | Puerto del servidor (default: 3000)  |
| `PUBLIC_URL` | URL pública para generar links       |
| `DB_URI`     | URI de conexión a MongoDB Atlas      |

## Endpoints

### Users

| Método   | Ruta              | Descripción                          |
|----------|-------------------|--------------------------------------|
| `GET`    | `/api/users`      | Listar usuarios (paginación + filtros) |
| `GET`    | `/api/users/:id`  | Obtener usuario por ID               |
| `POST`   | `/api/users`      | Crear usuario                        |
| `PUT`    | `/api/users/:id`  | Actualizar usuario                   |
| `DELETE` | `/api/users/:id`  | Eliminar usuario                     |

**Query params GET /api/users:** `?page=1&limit=10&role=admin&isActive=true`

### Tracks

| Método   | Ruta               | Descripción                          |
|----------|--------------------|--------------------------------------|
| `GET`    | `/api/tracks`      | Listar tracks (paginación + filtros) |
| `GET`    | `/api/tracks/:id`  | Obtener track (con populate)         |
| `POST`   | `/api/tracks`      | Crear track                          |
| `PUT`    | `/api/tracks/:id`  | Actualizar track                     |
| `DELETE` | `/api/tracks/:id`  | Eliminar track                       |

**Query params GET /api/tracks:** `?page=1&limit=10&genre=rock`

### Storage

| Método   | Ruta                | Descripción                          |
|----------|---------------------|--------------------------------------|
| `GET`    | `/api/storage`      | Listar archivos                      |
| `POST`   | `/api/storage`      | Subir archivo (`multipart/form-data`, field: `file`) |
| `DELETE` | `/api/storage/:id`  | Eliminar archivo (físico + BD)       |

### Otros

| Método | Ruta      | Descripción    |
|--------|-----------|----------------|
| `GET`  | `/health` | Estado del servidor |

## Estructura

```
proyecto/
├── src/
│   ├── app.js                  # Configuración de Express
│   ├── config/
│   │   └── db.js               # Conexión a MongoDB
│   ├── controllers/            # Lógica de negocio
│   ├── middleware/
│   │   ├── error.middleware.js # Manejo global de errores
│   │   └── validate.middleware.js # Validación Zod + ObjectId
│   ├── models/                 # Schemas de Mongoose
│   ├── routes/
│   │   ├── index.js            # Carga dinámica de rutas
│   │   └── *.routes.js
│   ├── schemas/                # Schemas de validación Zod
│   └── utils/
│       ├── handleError.js      # Utilidad de errores HTTP
│       └── handleStorage.js    # Configuración de Multer
├── storage/                    # Archivos subidos (git-ignorado)
├── index.js                    # Punto de entrada
├── .env
├── .env.example
└── package.json
```
