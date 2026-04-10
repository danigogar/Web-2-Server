import { io } from "socket.io-client";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZDk0MzNmM2RhMTYwNmQwMjVjOGU1YiIsImVtYWlsIjoidGVzdEBlamVtcGxvLmNvbSIsIm5hbWUiOiJVc3VhcmlvIFRlc3QiLCJpYXQiOjE3NzU4NDY4NzAsImV4cCI6MTc3NjQ1MTY3MH0.lLin3cMDdoHxNO-D9OyJXBZ0OifQEAf83ePP3L3fo3c"; // El token que obtuviste del login

const socket = io("http://localhost:3000", {
  auth: { token }
});

socket.on("connect", () => {
  console.log("✅ Conectado al servidor");
  
  // Unirse a una sala (usa el ID de la sala que creaste)
  socket.emit("room:join", { roomId: "69d943523da1606d025c8e60" });
});

socket.on("room:joined", (data) => {
  console.log(`📌 Unido a sala: ${data.room.name}`);
  
  // Enviar un mensaje
  socket.emit("chat:message", { 
    roomId: data.room.id, 
    content: "Hola desde el cliente!" 
  });
});

socket.on("chat:message", (data) => {
  console.log(`💬 ${data.user.name}: ${data.content}`);
});

socket.on("room:user-joined", (data) => {
  console.log(`👤 ${data.user.name} se unió a la sala`);
});