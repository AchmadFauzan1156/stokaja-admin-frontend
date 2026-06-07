import { io } from "socket.io-client";
import { getAccessToken } from "@/lib/api";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5001";

let socket = null;

/**
 * Dapatkan / buat koneksi Socket.io
 * Token akan dikirim saat handshake untuk autentikasi
 */
export function getSocket() {
  if (socket) return socket;

  const token = getAccessToken();
  if (!token) return null;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on("connect", () => {
    console.log("📡 Socket.io connected:", socket.id);
    
    // Parse JWT token manually to get user ID
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.id) {
        socket.emit("join_room", payload.id);
        console.log("Joined room:", payload.id);
      }
    } catch (e) {
      console.error("Gagal join room:", e);
    }
  });

  socket.on("connect_error", (err) => {
    console.error("Socket.io connection error:", err.message);
  });

  return socket;
}

/**
 * Putuskan koneksi socket (untuk logout)
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
