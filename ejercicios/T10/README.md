# 💬 Chat en Tiempo Real con Socket.IO

Aplicación de chat en tiempo real construida con **Socket.IO**, **Express** y **MongoDB Atlas**. Incluye autenticación JWT, salas de chat, mensajes privados, reacciones, envío de imágenes, búsqueda, edición/eliminación de mensajes y notificaciones de escritorio.

---

## 🚀 Características

### Funcionalidades principales
- ✅ Registro e inicio de sesión con JWT
- ✅ Autenticación en WebSocket
- ✅ Creación y gestión de salas de chat
- ✅ Mensajes en tiempo real
- ✅ Historial de mensajes persistente en MongoDB
- ✅ Indicador "escribiendo..."
- ✅ Presencia de usuarios (online/offline)

### Bonus incluidos
- ✅ **Mensajes privados (1 a 1)** — Conversaciones directas entre usuarios
- ✅ **Emojis/Reactions** — Reacciona con 👍 ❤️ 😂 😮 😢 a los mensajes
- ✅ **Envío de imágenes** — Comparte imágenes en Base64
- ✅ **Notificaciones de escritorio** — Notificaciones push del navegador
- ✅ **Búsqueda de mensajes** — Busca mensajes por texto en una sala
- ✅ **Mensajes editables/eliminables** — Edita o elimina tus propios mensajes

---

## 🛠️ Tecnologías

| Tecnología | Propósito |
|------------|-----------|
| **Node.js** | Entorno de ejecución |
| **Express** | Framework web y API REST |
| **Socket.IO** | Comunicación bidireccional en tiempo real |
| **MongoDB Atlas** | Base de datos en la nube |
| **Mongoose** | ODM para MongoDB |
| **JWT** | Autenticación de usuarios |
| **bcryptjs** | Encriptación de contraseñas |

---

## 📋 Requisitos previos

- Node.js v22 o superior
- npm v10 o superior
- Cuenta gratuita en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

## 🔧 Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/chat-realtime.git
cd chat-realtime
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/chat-realtime
JWT_SECRET=tu_secreto_jwt_muy_largo_y_seguro
PORT=3000
```

### 4. Configurar MongoDB Atlas

1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster gratuito (M0)
3. Crea un usuario con contraseña
4. Añade tu IP a la whitelist (`0.0.0.0/0` para desarrollo)
5. Copia la URI de conexión y pégala en `MONGODB_URI`

### 5. Iniciar el servidor

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`.

---

## 📁 Estructura del proyecto

```
chat-realtime/
├── src/
│   ├── app.js                    # Configuración principal
│   ├── config/
│   │   └── db.js                 # Conexión a MongoDB
│   ├── models/
│   │   ├── user.model.js
│   │   ├── room.model.js
│   │   └── message.model.js
│   ├── middleware/
│   │   └── auth.middleware.js    # Autenticación JWT
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── rooms.routes.js
│   ├── socket/
│   │   ├── index.js              # Configuración de Socket.IO
│   │   └── handlers/
│   │       ├── room.handler.js
│   │       └── chat.handler.js
│   └── utils/
│       ├── password.js
│       └── jwt.js
├── public/
│   └── index.html                # Frontend completo
├── tests/
│   └── api.http                  # Pruebas con REST Client
├── test-client.js                # Cliente WebSocket de prueba (usuario 1)
├── test-client2.js               # Cliente WebSocket de prueba (usuario 2)
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 📖 API REST

### Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Registrar nuevo usuario |
| `POST` | `/api/auth/login` | Iniciar sesión |
| `GET` | `/api/auth/me` | Obtener perfil del usuario autenticado |
| `GET` | `/api/auth/users` | Listar todos los usuarios |

### Salas

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/rooms` | Listar todas las salas |
| `POST` | `/api/rooms` | Crear nueva sala |
| `GET` | `/api/rooms/:id/messages` | Obtener mensajes de una sala |
| `GET` | `/api/rooms/:id/messages?search=texto` | Buscar mensajes por texto |

---

## 📡 Eventos de Socket.IO

### Cliente → Servidor

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `room:join` | `{ roomId }` | Unirse a una sala |
| `room:leave` | `{ roomId }` | Salir de una sala |
| `chat:message` | `{ roomId, content, image, isPrivate, toUserId }` | Enviar mensaje |
| `chat:typing` | `{ roomId }` | Indicar que está escribiendo |
| `chat:stop-typing` | `{ roomId }` | Dejar de escribir |
| `chat:reaction` | `{ messageId, reactionType }` | Añadir reacción a un mensaje |
| `chat:edit` | `{ messageId, newContent }` | Editar mensaje propio |
| `chat:delete` | `{ messageId }` | Eliminar mensaje propio |

### Servidor → Cliente

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `room:joined` | `{ room, users }` | Confirmación de unión a sala |
| `room:user-joined` | `{ user }` | Otro usuario se unió |
| `room:user-left` | `{ user }` | Otro usuario salió |
| `chat:message` | `{ id, content, image, user, timestamp }` | Nuevo mensaje en sala |
| `chat:private` | `{ id, content, user, timestamp }` | Mensaje privado recibido |
| `chat:private:sent` | `{ id, content, timestamp }` | Confirmación de mensaje privado enviado |
| `chat:typing` | `{ user }` | Un usuario está escribiendo |
| `chat:stop-typing` | `{ user }` | Un usuario dejó de escribir |
| `chat:reaction-updated` | `{ messageId, reaction, user }` | Reacción añadida |
| `chat:message-edited` | `{ messageId, newContent, editedAt }` | Mensaje editado |
| `chat:message-deleted` | `{ messageId }` | Mensaje eliminado |
| `user:online` | `{ userId, name }` | Usuario se conectó |
| `user:offline` | `{ userId, name }` | Usuario se desconectó |

---

## 🧪 Cómo probar la aplicación

### Opción 1: Frontend integrado (recomendado)

1. Abre `http://localhost:3000` en el navegador
2. Regístrate con un usuario
3. Crea o únete a una sala
4. Prueba todas las funcionalidades desde la interfaz

### Opción 2: Dos navegadores en paralelo

1. Abre Chrome en `http://localhost:3000`
2. Abre Firefox (o una ventana de incógnito) en `http://localhost:3000`
3. Regístrate con dos usuarios diferentes
4. Únete a la misma sala y prueba la comunicación en tiempo real

### Opción 3: Clientes Node.js por terminal

Instala la dependencia de cliente:

```bash
npm install socket.io-client
```

**test-client.js** (Usuario 1):

```javascript
import { io } from "socket.io-client";

async function main() {
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test@ejemplo.com", password: "123456" })
  });
  const { token, user } = await loginRes.json();
  console.log(`👤 Usuario 1: ${user.name}`);

  const socket = io("http://localhost:3000", { auth: { token } });
  const roomId = "ID_DE_LA_SALA"; // Reemplaza con el ID real

  socket.on("connect", () => {
    console.log("✅ Conectado");
    socket.emit("room:join", { roomId });
  });

  socket.on("room:joined", ({ room }) => {
    console.log(`📌 Unido a sala: ${room.name}`);
    socket.emit("chat:message", { roomId, content: "Hola desde Usuario 1!" });
  });

  socket.on("chat:message", ({ user, content }) => {
    console.log(`💬 ${user.name}: ${content}`);
  });
}

main();
```

**test-client2.js** (Usuario 2):

```javascript
import { io } from "socket.io-client";

async function main() {
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test2@ejemplo.com", password: "123456" })
  });
  const { token, user } = await loginRes.json();
  console.log(`👤 Usuario 2: ${user.name}`);

  const socket = io("http://localhost:3000", { auth: { token } });
  const roomId = "ID_DE_LA_SALA";

  socket.on("connect", () => {
    socket.emit("room:join", { roomId });
  });

  socket.on("chat:message", ({ user, content }) => {
    console.log(`💬 ${user.name}: ${content}`);
    if (content.includes("Hola desde")) {
      setTimeout(() => {
        socket.emit("chat:message", { roomId, content: "Hola desde Usuario 2!" });
      }, 1000);
    }
  });

  socket.on("room:user-joined", ({ user }) => {
    console.log(`👤 ${user.name} se unió a la sala`);
  });
}

main();
```

Ejecuta cada cliente en una terminal distinta:

```bash
# Terminal 1
node test-client.js

# Terminal 2
node test-client2.js
```

### Opción 4: REST Client (VS Code)

Usa el archivo `tests/api.http` con la extensión **REST Client**:

```http
### Login
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "test@ejemplo.com",
  "password": "123456"
}

### Listar salas
GET http://localhost:3000/api/rooms
Authorization: Bearer {{login.response.body.token}}

### Buscar mensajes
GET http://localhost:3000/api/rooms/ID_SALA/messages?search=hola
Authorization: Bearer {{login.response.body.token}}
```

---

## 📦 Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar servidor con hot-reload |
| `npm start` | Iniciar servidor en producción |
| `node test-client.js` | Ejecutar cliente WebSocket 1 |
| `node test-client2.js` | Ejecutar cliente WebSocket 2 |

---

## 🐛 Solución de problemas comunes

| Problema | Solución |
|----------|----------|
| `MongoDB connection error` | Verifica la URI en `.env` y que tu IP esté en la whitelist de Atlas |
| `Token inválido` | El token expiró (7 días). Vuelve a hacer login |
| Los mensajes no aparecen | Verifica que estás unido a la sala correcta (`room:join`) |
| Las imágenes no se ven | Las imágenes viajan en Base64; pueden tardar si son pesadas |
| `Cannot find package 'socket.io-client'` | Ejecuta `npm install socket.io-client` |

---

## 📄 Licencia

MIT

---

## 👨‍💻 Autor

Daniel González — [@danigogar](https://github.com/danigogar)
