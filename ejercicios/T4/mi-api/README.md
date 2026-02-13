# 📝 API de Tareas (Todos)

API REST para gestionar tareas con Express 5 y validación con Zod.

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd mi-api
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**Windows (CMD):**
```cmd
copy .env.example .env
```

**Linux/Mac:**
```bash
cp .env.example .env
```

**O simplemente:** Crea manualmente el archivo `.env` copiando el contenido de `.env.example`

### 4. Ejecutar en desarrollo
```bash
npm run dev
```

El servidor arrancará en `http://localhost:3000`

## 📚 Endpoints

### Listar todas las tareas
```http
GET /api/todos
```

**Filtros disponibles:**
- `?completed=true|false` - Filtrar por estado
- `?priority=low|medium|high` - Filtrar por prioridad

**Ejemplos:**
```http
GET /api/todos?completed=false
GET /api/todos?priority=high
GET /api/todos?completed=false&priority=high
```

### Obtener una tarea
```http
GET /api/todos/:id
```

**Ejemplo:**
```http
GET /api/todos/1
```

### Crear tarea
```http
POST /api/todos
Content-Type: application/json

{
  "title": "Nueva tarea",
  "description": "Descripción opcional",
  "priority": "medium"
}
```

**Validaciones:**
- `title`: 3-100 caracteres (requerido)
- `description`: string (opcional)
- `priority`: "low", "medium" o "high" (opcional, default: "medium")

### Actualizar tarea
```http
PUT /api/todos/:id
Content-Type: application/json

{
  "title": "Tarea actualizada",
  "description": "Nueva descripción",
  "completed": true,
  "priority": "low"
}
```

### Alternar estado completada
```http
PATCH /api/todos/:id/toggle
```

Cambia el estado de `completed` de `true` a `false` o viceversa.

### Eliminar tarea
```http
DELETE /api/todos/:id
```

## 🏗️ Estructura del Proyecto
```
mi-api/
├── src/
│   ├── index.js              # Punto de entrada
│   ├── app.js                # Configuración Express
│   ├── routes/
│   │   ├── index.js          # Agregador de rutas
│   │   └── todo.routes.js
│   ├── controllers/
│   │   └── todo.controller.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── validateRequest.js
│   ├── schemas/
│   │   └── todo.schema.js
│   └── data/
│       └── todos.js          # Datos en memoria
├── .env                      # Variables de entorno (no se sube a Git)
├── .env.example              # Plantilla de variables
├── .gitignore
├── package.json
└── README.md
```

## 🛠️ Tecnologías

- **Node.js** v20.11.0 o superior
- **Express** 5.0.1 - Framework web
- **Zod** 3.23.8 - Validación de esquemas
- **Helmet** 8.0.0 - Seguridad HTTP
- **CORS** 2.8.5 - Cross-Origin Resource Sharing

## 📝 Scripts disponibles
```bash
npm run dev    # Desarrollo con hot-reload (--watch)
npm start      # Producción
```

## ✅ Modelo de Datos

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| id | number | auto | ID único autoincrementable |
| title | string | sí | Título (3-100 caracteres) |
| description | string | no | Descripción opcional |
| completed | boolean | no | Estado (default: false) |
| priority | enum | no | "low", "medium", "high" (default: "medium") |
| createdAt | string | auto | Fecha de creación en formato ISO |

## 🧪 Probar la API

### Opción 1: REST Client (VS Code)

1. Instala la extensión **REST Client** de Huachao Mao
2. Abre el archivo `index.http`
3. Haz clic en "Send Request" sobre cada petición

### Opción 2: cURL

**Listar tareas:**
```bash
curl http://localhost:3000/api/todos
```

**Crear tarea:**
```bash
curl -X POST http://localhost:3000/api/todos ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"Mi tarea\",\"priority\":\"high\"}"
```

> **Nota Windows CMD:** Usa `^` para continuar líneas. En PowerShell usa `` ` ``.  
> **Nota Linux/Mac:** Usa `\` para continuar líneas.

### Opción 3: Postman / Insomnia

Importa la colección o prueba manualmente los endpoints.

## ⚙️ Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:
```env
NODE_ENV=development
PORT=3000
```

| Variable | Descripción | Default |
|----------|-------------|---------|
| NODE_ENV | Entorno de ejecución | development |
| PORT | Puerto del servidor | 3000 |

## 🔍 Ejemplos de Uso

### Crear varias tareas
```bash
# Windows PowerShell
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/todos" `
  -ContentType "application/json" `
  -Body '{"title":"Estudiar Express","priority":"high"}'

# Linux/Mac
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Estudiar Express","priority":"high"}'
```

### Filtrar tareas pendientes de alta prioridad
```bash
# Funciona igual en Windows, Linux y Mac
curl "http://localhost:3000/api/todos?completed=false&priority=high"
```

### Marcar tarea como completada
```bash
# Windows/Linux/Mac
curl -X PATCH http://localhost:3000/api/todos/1/toggle
```

## 🚨 Solución de Problemas

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
rm -rf node_modules  # Linux/Mac
Remove-Item -Recurse -Force node_modules  # Windows PowerShell
npm install
```

### Error: "Port 3000 already in use"
```bash
# Cambiar puerto en .env
PORT=3001
```

### Servidor no reinicia con cambios
```bash
# Detener (Ctrl+C) y reiniciar
npm run dev
```


## 👨‍💻 Autor

Daniel González García